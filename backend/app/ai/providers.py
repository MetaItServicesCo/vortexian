"""Model providers for the AI assistant.

Every model is named with a "provider:model" string from the environment, e.g.

    AI_CHAT_MODEL=groq:llama-3.3-70b-versatile
    AI_CHAT_MODEL=anthropic:claude-sonnet-5-5
    AI_CHAT_MODEL=openai:gpt-5-mini
    AI_EMBEDDING_MODEL=fastembed:BAAI/bge-small-en-v1.5
    AI_EMBEDDING_MODEL=openai:text-embedding-3-small

Switching provider is a configuration change: install the provider's LangChain
package (listed below), set its API key variable, change the string. Nothing
else in the assistant refers to a specific provider.

"fake:" models are deterministic stand-ins for tests and local development
without an API key.
"""
from __future__ import annotations

import hashlib
import importlib
import json
import math
import os
import re
import threading
from functools import lru_cache
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult

from app.config import settings

# provider -> (python module, chat class, API key variable or None)
CHAT_PROVIDERS: dict[str, tuple[str, str, str | None]] = {
    "groq": ("langchain_groq", "ChatGroq", "GROQ_API_KEY"),
    "openai": ("langchain_openai", "ChatOpenAI", "OPENAI_API_KEY"),
    "anthropic": ("langchain_anthropic", "ChatAnthropic", "ANTHROPIC_API_KEY"),
    "google": ("langchain_google_genai", "ChatGoogleGenerativeAI", "GOOGLE_API_KEY"),
    "mistral": ("langchain_mistralai", "ChatMistralAI", "MISTRAL_API_KEY"),
    "ollama": ("langchain_ollama", "ChatOllama", None),
}

# provider -> (python module, embeddings class, API key variable or None); fastembed runs locally
EMBEDDING_PROVIDERS: dict[str, tuple[str, str, str | None]] = {
    "openai": ("langchain_openai", "OpenAIEmbeddings", "OPENAI_API_KEY"),
    "google": ("langchain_google_genai", "GoogleGenerativeAIEmbeddings", "GOOGLE_API_KEY"),
    "mistral": ("langchain_mistralai", "MistralAIEmbeddings", "MISTRAL_API_KEY"),
    "ollama": ("langchain_ollama", "OllamaEmbeddings", None),
}


class ProviderError(RuntimeError):
    """The model can't be used (unknown provider, missing package or API key)."""


def split_spec(spec: str) -> tuple[str, str]:
    provider, _, model = (spec or "").partition(":")
    provider = provider.strip().lower()
    if not provider:
        raise ProviderError("No model configured.")
    return provider, model.strip()


def missing_key(spec: str, kind: str = "chat") -> str | None:
    """The API key variable this model needs but doesn't have, if any."""
    provider, _ = split_spec(spec)
    table = CHAT_PROVIDERS if kind == "chat" else EMBEDDING_PROVIDERS
    key = table.get(provider, (None, None, None))[2]
    return key if key and not os.getenv(key) else None


# ---------------------------------------------------------------- chat models

def chat_model(spec: str, *, temperature: float = 0.2, max_tokens: int = 600) -> BaseChatModel:
    provider, model = split_spec(spec)
    if provider == "fake":
        return FakeAssistantModel()
    if provider not in CHAT_PROVIDERS:
        raise ProviderError(f"Unknown chat provider '{provider}'. Known: {', '.join(sorted(CHAT_PROVIDERS))}, fake.")
    module_name, class_name, key = CHAT_PROVIDERS[provider]
    if key and not os.getenv(key):
        raise ProviderError(f"{key} is not set on the server.")
    try:
        cls = getattr(importlib.import_module(module_name), class_name)
    except ImportError as err:
        raise ProviderError(f"Install the '{module_name.replace('_', '-')}' package to use {provider} models.") from err
    kwargs: dict[str, Any] = {"model": model, "temperature": temperature, "max_retries": 1, "timeout": 30}
    # Each LangChain integration names the output limit its own way
    kwargs["max_output_tokens" if provider == "google" else "num_predict" if provider == "ollama" else "max_tokens"] = max_tokens
    if provider == "ollama":
        kwargs.pop("max_retries"), kwargs.pop("timeout")
    if provider == "groq" and "gpt-oss" in model:
        # Reasoning models: think briefly and don't send the reasoning back (it
        # still uses output tokens, so the callers' limits leave room for it)
        kwargs["reasoning_effort"] = "low"
        kwargs["model_kwargs"] = {"include_reasoning": False}
    return cls(**kwargs)


def text_of(message: BaseMessage | str) -> str:
    """Plain text of a model reply (some providers return content blocks)."""
    content = message if isinstance(message, str) else message.content
    if isinstance(content, list):
        return "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in content)
    return str(content or "")


def parse_json(text: str) -> dict:
    """First JSON object in a model reply (models sometimes wrap it in prose or ```json)."""
    match = re.search(r"\{.*\}", text or "", re.S)
    if not match:
        return {}
    try:
        value = json.loads(match.group(0))
    except ValueError:
        return {}
    return value if isinstance(value, dict) else {}


# ---------------------------------------------------------------- embeddings

class Embedder:
    name: str
    def embed_documents(self, texts: list[str]) -> list[list[float]]: ...
    def embed_query(self, text: str) -> list[float]: ...


class FastEmbedder(Embedder):
    """Local ONNX embedding model (no API key, ~220 MB of memory, loaded on first use)."""

    def __init__(self, spec: str, model: str):
        self.name, self._model_name, self._model, self._lock = spec, model, None, threading.Lock()

    def _load(self):
        with self._lock:
            if self._model is None:
                try:
                    from fastembed import TextEmbedding
                except ImportError as err:
                    raise ProviderError("Install the 'fastembed' package to use fastembed embeddings.") from err
                self._model = TextEmbedding(self._model_name, cache_dir=settings.ai_model_cache, threads=1)
        return self._model

    def embed_documents(self, texts):
        return [vector.tolist() for vector in self._load().embed(texts, batch_size=32)]

    def embed_query(self, text):
        return next(iter(self._load().query_embed(text))).tolist()


class LangChainEmbedder(Embedder):
    def __init__(self, spec: str, impl):
        self.name, self._impl = spec, impl

    def embed_documents(self, texts):
        return self._impl.embed_documents(texts)

    def embed_query(self, text):
        return self._impl.embed_query(text)


class FakeEmbedder(Embedder):
    """Deterministic word-hashing vectors: similar words, similar vectors. Tests only."""
    dims = 256

    def __init__(self, spec: str):
        self.name = spec

    def _vec(self, text: str) -> list[float]:
        vector = [0.0] * self.dims
        for word in re.findall(r"[a-z0-9]+", text.lower()):
            if len(word) > 2:
                vector[int(hashlib.md5(word.encode()).hexdigest(), 16) % self.dims] += 1.0
        norm = math.sqrt(sum(v * v for v in vector)) or 1.0
        return [v / norm for v in vector]

    def embed_documents(self, texts):
        return [self._vec(t) for t in texts]

    def embed_query(self, text):
        return self._vec(text)


@lru_cache(maxsize=4)
def embedder(spec: str | None = None) -> Embedder:
    spec = spec or settings.ai_embedding_model
    provider, model = split_spec(spec)
    if provider == "fake":
        return FakeEmbedder(spec)
    if provider == "fastembed":
        return FastEmbedder(spec, model)
    if provider not in EMBEDDING_PROVIDERS:
        raise ProviderError(f"Unknown embeddings provider '{provider}'. Known: fastembed, {', '.join(sorted(EMBEDDING_PROVIDERS))}, fake.")
    module_name, class_name, key = EMBEDDING_PROVIDERS[provider]
    if key and not os.getenv(key):
        raise ProviderError(f"{key} is not set on the server.")
    try:
        cls = getattr(importlib.import_module(module_name), class_name)
    except ImportError as err:
        raise ProviderError(f"Install the '{module_name.replace('_', '-')}' package to use {provider} embeddings.") from err
    return LangChainEmbedder(spec, cls(model=model))


# ---------------------------------------------------------------- speech to text

# provider -> API key variable; "fake:" returns a fixed sentence (tests)
TRANSCRIBE_PROVIDERS = {"groq": "GROQ_API_KEY", "openai": "OPENAI_API_KEY"}


def transcribe(spec: str, filename: str, audio: bytes) -> tuple[str, str | None]:
    """Text of a voice message, and its language code when the provider reports it."""
    provider, model = split_spec(spec)
    if provider == "fake":
        return "What services do you offer?", "en"
    if provider not in TRANSCRIBE_PROVIDERS:
        raise ProviderError(f"Unknown speech-to-text provider '{provider}'. Known: {', '.join(sorted(TRANSCRIBE_PROVIDERS))}, fake.")
    key = TRANSCRIBE_PROVIDERS[provider]
    if not os.getenv(key):
        raise ProviderError(f"{key} is not set on the server.")
    try:
        if provider == "groq":
            from groq import Groq as Client
        else:
            from openai import OpenAI as Client
    except ImportError as err:
        raise ProviderError(f"Install the '{provider}' package for {provider} speech to text.") from err
    result = Client(max_retries=1, timeout=30).audio.transcriptions.create(
        model=model, file=(filename, audio), response_format="verbose_json", temperature=0.0)
    language = getattr(result, "language", None)
    return (getattr(result, "text", "") or "").strip(), LANGUAGE_CODES.get(str(language or "").lower(), language)


# Whisper reports language names; browsers' speech synthesis wants codes
LANGUAGE_CODES = {
    "english": "en", "arabic": "ar", "urdu": "ur", "hindi": "hi", "spanish": "es", "french": "fr", "german": "de",
    "portuguese": "pt", "italian": "it", "dutch": "nl", "turkish": "tr", "russian": "ru", "chinese": "zh",
    "japanese": "ja", "korean": "ko", "persian": "fa", "bengali": "bn", "punjabi": "pa", "indonesian": "id", "malay": "ms",
}


# ---------------------------------------------------------------- fake chat model (tests)

class FakeAssistantModel(BaseChatModel):
    """Answers the assistant's prompts by simple rules, so the whole workflow can
    be tested without an API key. Prompts mark their task with "TASK: <NAME>"."""

    @property
    def _llm_type(self) -> str:
        return "fake-assistant"

    def _generate(self, messages: list[BaseMessage], stop=None, run_manager=None, **kwargs) -> ChatResult:
        system = text_of(messages[0]) if messages else ""
        last = text_of(messages[-1]) if messages else ""
        task = (re.search(r"TASK: (\w+)", system) or re.search(r"TASK: (\w+)", last))
        reply = self._reply(task.group(1) if task else "", system, last)
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=reply))])

    @staticmethod
    def _reply(task: str, system: str, last: str) -> str:
        if task == "ROUTE":
            message = last.split("Visitor message:", 1)[-1].lower()
            if "Lead capture in progress: yes" in last and not message.strip().endswith("?"):
                return json.dumps({"route": "lead"})
            lead = re.search(r"\b(quote|pricing|price|contact me|call me|email me|hire|proposal|get in touch|my name|my email|@)\b", message)
            return json.dumps({"route": "lead" if lead else "chat"})
        if task == "EXTRACT":
            message = last.split("Visitor message:", 1)[-1].strip()
            name = re.search(r"(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)", message)
            company = re.search(r"(?:from|at|company is)\s+([A-Z][\w&]+(?:\s[A-Z][\w&]+)?)", message)
            need = re.search(r"(?:need|want|looking for|interested in)\s+(.+?)(?:[.!]|$)", message, re.I)
            declined = bool(re.search(r"\b(no thanks|not now|no thank you|don't want)\b", message, re.I))
            return json.dumps({
                "name": name.group(1) if name else "", "company": company.group(1) if company else "",
                "need": need.group(1).strip() if need else "", "declined": declined,
            })
        if task == "ANSWER":
            context = system.split("CONTEXT:", 1)[-1]
            source = re.search(r"\[source: ([^\]]+)\]\s*\(([^)]+)\)\n(.+)", context)
            if not source:
                return "I'm not sure about that. You can reach our team on the [Contact](/contact) page."
            lines =[l for l in context.split("\n") if len(l) > 40 and not l.startswith("[source:")]
            sentence = re.split(r"(?<=[.!?])\s", (lines[0] if lines else source.group(3)).strip())[0]
            return f"{sentence} More on [{source.group(1)}]({source.group(2)}).\nFOLLOW_UPS: How much does it cost? | How long does it take? | Can I see examples?"
        if task == "NUDGE":
            page = re.search(r"The visitor is on: (.+)", system)
            return f"Exploring {page.group(1).strip() if page else 'our services'}? I can help you find the right fit. Would you like our team to send you a tailored quote?"
        if task == "LEAD":
            missing = re.search(r"Still needed: (.+)", system)
            if missing and missing.group(1).strip() != "nothing":
                return f"Thanks! Could you share {missing.group(1).strip()}?"
            return "Thank you, that's everything. Our team will be in touch shortly."
        return "Hello!"
