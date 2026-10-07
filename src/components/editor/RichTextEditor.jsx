"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import {
    Bold, Italic, Underline, Strikethrough, Link2, List, ListOrdered, Quote,
    Code2, Minus, AlignLeft, AlignCenter, AlignRight, AlignJustify, ImagePlus,
    Film, Table as TableIcon, Undo2, Redo2, RemoveFormatting, Loader2,
    ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine,
    Rows3, Columns3, Merge, Split, Heading, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadMedia } from "@/lib/adminApi";

// <video> blocks (used by the news feed). Sanitised server-side.
const Video = Node.create({
    name: "video",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (el) => el.getAttribute("src") || el.querySelector("source")?.getAttribute("src"),
            },
        };
    },
    parseHTML() {
        return [{ tag: "video" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["video", mergeAttributes(HTMLAttributes, { controls: "true" })];
    },
});

function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// Spreadsheets normally put an HTML table on the clipboard, which the table
// extension parses directly. Some apps only provide tab-separated text, so
// turn that into a table too.
function tsvToTable(text) {
    const rows = text.replace(/\r/g, "").replace(/\n+$/, "").split("\n");
    if (rows.length < 2 || !rows.every((row) => row.includes("\t"))) return null;

    const cells = rows.map((row) => row.split("\t"));
    const header = `<tr>${cells[0].map((c) => `<th><p>${escapeHtml(c)}</p></th>`).join("")}</tr>`;
    const body = cells
        .slice(1)
        .map((row) => `<tr>${row.map((c) => `<td><p>${escapeHtml(c)}</p></td>`).join("")}</tr>`)
        .join("");
    return `<table><tbody>${header}${body}</tbody></table>`;
}

function ToolbarButton({ onClick, active, disabled, title, children }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`h-8 min-w-8 px-1.5 rounded-md flex items-center justify-center text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                active ? "bg-[#1D1D7E] text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
        >
            {children}
        </button>
    );
}

const Divider = () => <span className="w-px h-6 bg-slate-200 mx-1" />;

export default function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Start writing…",
    minHeight = 280,
    allowVideo = false,
}) {
    const [uploading, setUploading] = useState(false);
    const imageInput = useRef(null);
    const videoInput = useRef(null);
    const editorRef = useRef(null);

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
            }),
            TableKit.configure({ table: { resizable: true } }),
            Image.configure({ allowBase64: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({ placeholder }),
            Video,
        ],
        content: value || "",
        editorProps: {
            attributes: { class: "rich-content tiptap-editor focus:outline-none" },
            handlePaste(view, event) {
                const html = event.clipboardData?.getData("text/html");
                const text = event.clipboardData?.getData("text/plain");
                if (html || !text) return false;

                const table = tsvToTable(text);
                if (!table) return false;

                editorRef.current?.chain().focus().insertContent(table).run();
                return true;
            },
        },
        onUpdate({ editor }) {
            onChange?.(editor.isEmpty ? "" : editor.getHTML());
        },
    });

    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    // Keep the editor in sync when the value is loaded asynchronously
    useEffect(() => {
        if (!editor) return;
        const current = editor.isEmpty ? "" : editor.getHTML();
        if ((value || "") !== current) {
            editor.commands.setContent(value || "", { emitUpdate: false });
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div className="border border-gray-200 rounded-xl bg-white flex items-center justify-center" style={{ minHeight }}>
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
        );
    }

    const chain = () => editor.chain().focus();
    const inTable = editor.isActive("table");

    const setLink = () => {
        const previous = editor.getAttributes("link").href || "";
        const url = window.prompt("Link URL (leave empty to remove)", previous);
        if (url === null) return;
        if (url.trim() === "") {
            chain().extendMarkRange("link").unsetLink().run();
            return;
        }
        chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
    };

    const handleUpload = async (file, kind) => {
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadMedia(file);
            if (kind === "video") {
                chain().insertContent({ type: "video", attrs: { src: url } }).run();
            } else {
                chain().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
            }
        } catch (err) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const headingValue = [2, 3, 4].find((level) => editor.isActive("heading", { level })) || 0;

    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1D1D7E]/40">
            {/* ---------- Toolbar ---------- */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-slate-50">
                <label className="flex items-center gap-1 text-slate-600 mr-1" title="Text style">
                    <Heading size={15} />
                    <select
                        value={headingValue}
                        onChange={(e) => {
                            const level = Number(e.target.value);
                            if (level) chain().toggleHeading({ level }).run();
                            else chain().setParagraph().run();
                        }}
                        className="h-8 text-sm bg-transparent rounded-md px-1 hover:bg-slate-200 cursor-pointer outline-none"
                    >
                        <option value={0}>Paragraph</option>
                        <option value={2}>Heading 2</option>
                        <option value={3}>Heading 3</option>
                        <option value={4}>Heading 4</option>
                    </select>
                </label>
                <Divider />
                <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}><Bold size={15} /></ToolbarButton>
                <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
                <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}><Underline size={15} /></ToolbarButton>
                <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}><Strikethrough size={15} /></ToolbarButton>
                <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 size={15} /></ToolbarButton>
                <Divider />
                <ToolbarButton title="Bulleted list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}><List size={15} /></ToolbarButton>
                <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={15} /></ToolbarButton>
                <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}><Quote size={15} /></ToolbarButton>
                <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()}><Code2 size={15} /></ToolbarButton>
                <ToolbarButton title="Divider line" onClick={() => chain().setHorizontalRule().run()}><Minus size={15} /></ToolbarButton>
                <Divider />
                <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}><AlignLeft size={15} /></ToolbarButton>
                <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}><AlignCenter size={15} /></ToolbarButton>
                <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}><AlignRight size={15} /></ToolbarButton>
                <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => chain().setTextAlign("justify").run()}><AlignJustify size={15} /></ToolbarButton>
                <Divider />
                <ToolbarButton title="Upload image" disabled={uploading} onClick={() => imageInput.current?.click()}>
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                </ToolbarButton>
                {allowVideo && (
                    <ToolbarButton title="Upload video" disabled={uploading} onClick={() => videoInput.current?.click()}><Film size={15} /></ToolbarButton>
                )}
                <ToolbarButton
                    title="Insert table"
                    active={inTable}
                    onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                    <TableIcon size={15} />
                </ToolbarButton>
                <Divider />
                <ToolbarButton title="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}><RemoveFormatting size={15} /></ToolbarButton>
                <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}><Undo2 size={15} /></ToolbarButton>
                <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}><Redo2 size={15} /></ToolbarButton>

                <input ref={imageInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/avif" className="hidden"
                    onChange={(e) => { handleUpload(e.target.files?.[0], "image"); e.target.value = ""; }} />
                <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
                    onChange={(e) => { handleUpload(e.target.files?.[0], "video"); e.target.value = ""; }} />
            </div>

            {/* ---------- Table controls (only inside a table) ---------- */}
            {inTable && (
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-blue-50/60 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#1D1D7E] mr-2">Table</span>
                    <ToolbarButton title="Add row above" onClick={() => chain().addRowBefore().run()}><ArrowUpToLine size={14} /></ToolbarButton>
                    <ToolbarButton title="Add row below" onClick={() => chain().addRowAfter().run()}><ArrowDownToLine size={14} /></ToolbarButton>
                    <ToolbarButton title="Delete row" onClick={() => chain().deleteRow().run()}><Rows3 size={14} className="text-red-500" /></ToolbarButton>
                    <Divider />
                    <ToolbarButton title="Add column left" onClick={() => chain().addColumnBefore().run()}><ArrowLeftToLine size={14} /></ToolbarButton>
                    <ToolbarButton title="Add column right" onClick={() => chain().addColumnAfter().run()}><ArrowRightToLine size={14} /></ToolbarButton>
                    <ToolbarButton title="Delete column" onClick={() => chain().deleteColumn().run()}><Columns3 size={14} className="text-red-500" /></ToolbarButton>
                    <Divider />
                    <ToolbarButton title="Merge cells" disabled={!editor.can().mergeCells()} onClick={() => chain().mergeCells().run()}><Merge size={14} /></ToolbarButton>
                    <ToolbarButton title="Split cell" disabled={!editor.can().splitCell()} onClick={() => chain().splitCell().run()}><Split size={14} /></ToolbarButton>
                    <ToolbarButton title="Toggle header row" onClick={() => chain().toggleHeaderRow().run()}>
                        <span className="font-bold">H</span>
                    </ToolbarButton>
                    <Divider />
                    <ToolbarButton title="Delete table" onClick={() => chain().deleteTable().run()}>
                        <Trash2 size={14} className="text-red-500" />
                    </ToolbarButton>
                </div>
            )}

            <EditorContent editor={editor} className="px-5 py-4 overflow-x-auto" style={{ minHeight }} />

            <p className="px-4 py-2 border-t border-gray-100 bg-slate-50 text-[11px] text-slate-400">
                Tip: tables copied from Word, Excel, Google Docs/Sheets or web pages paste as tables.
            </p>
        </div>
    );
}
