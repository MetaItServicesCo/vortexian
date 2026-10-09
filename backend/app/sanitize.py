"""HTML sanitising for rich text written in the admin editor.

Rich text is rendered on the public site with dangerouslySetInnerHTML, so it is
cleaned on save: scripts, event handlers and javascript: URLs are removed while
formatting, tables, images and embedded video survive.
"""
import re
from typing import Any

import nh3

_TAGS = set(nh3.ALLOWED_TAGS) | {"video", "source"}

_ALIGNABLE = {"style", "class"}
_ATTRIBUTES: dict[str, set[str]] = {
    "*": {"class"},
    "a": {"href", "title", "target", "rel"},
    "img": {"src", "alt", "title", "width", "height", "style"},
    "video": {"src", "controls", "poster", "width", "height", "style"},
    "source": {"src", "type"},
    "table": {"style"},
    "col": {"style", "span", "width"},
    "th": {"colspan", "rowspan", "colwidth", "style"},
    "td": {"colspan", "rowspan", "colwidth", "style"},
    **{tag: _ALIGNABLE for tag in ("p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "div", "span")},
}

# Only presentational CSS the editor itself produces
_STYLE_PROPERTIES = {
    "text-align", "width", "min-width", "max-width", "height",
    "color", "background-color", "font-weight", "font-style", "text-decoration",
}


_BARE_DOMAIN = re.compile(r"^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#].*)?$", re.I)
_EMAIL = re.compile(r"^[^\s@/:]+@[^\s@/]+\.[a-z]{2,}$", re.I)
_SCHEME = re.compile(r"^[a-z][a-z0-9+.-]*:", re.I)


def normalize_href(value: str | None) -> str | None:
    """Make a link typed in the editor work. Mirrors normalizeHref() in src/lib/links.js.

    "www.mbmts.com" is otherwise a *relative* link that opens
    /blog/www.mbmts.com. Unsafe schemes are left for nh3 to strip.
    """
    href = (value or "").strip()
    if not href or href.startswith(("/", "#", "?")) and not href.startswith("//"):
        return href
    if href.startswith("//"):
        return "https:" + href
    if _BARE_DOMAIN.match(href):
        return "https://" + href
    if _EMAIL.match(href):
        return "mailto:" + href
    if _SCHEME.match(href):
        return href
    return "/" + re.sub(r"^\.?/+", "", href)  # "services/web" is a page on this site


def _attribute_filter(tag: str, attribute: str, value: str) -> str | None:
    if tag == "a" and attribute == "href":
        return normalize_href(value) or None
    return value


def clean_html(value: str | None) -> str | None:
    if value is None:
        return None
    return nh3.clean(
        value,
        tags=_TAGS,
        attributes=_ATTRIBUTES,
        url_schemes={"http", "https", "mailto", "tel"},
        filter_style_properties=_STYLE_PROPERTIES,
        attribute_filter=_attribute_filter,
        link_rel=None,
    )


def clean_html_fields(data: Any) -> Any:
    """Recursively sanitise every value whose key ends in "_html".

    Content sections are free-form JSON; rich text fields follow that naming
    convention so plain text values are left untouched.
    """
    if isinstance(data, dict):
        return {
            key: clean_html(value) if key.endswith("_html") and isinstance(value, str) else clean_html_fields(value)
            for key, value in data.items()
        }
    if isinstance(data, list):
        return [clean_html_fields(item) for item in data]
    return data


def slugify(value: str | None) -> str:
    """URL-safe slug: "Sit necessitatibus " -> "sit-necessitatibus"."""
    import re
    import unicodedata

    text = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.replace("&", " and ")).strip("-").lower()
    return text[:150].rstrip("-")
