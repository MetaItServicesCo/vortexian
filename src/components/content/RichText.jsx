import { normalizeLinks } from "@/lib/links";

// Renders rich text from the editor. HTML is sanitised by the API on save.
// Older records may hold plain text, which is shown as paragraphs.
export default function RichText({ html, className = "" }) {
    if (!html) return null;

    const isHtml = /<\/?[a-z][\s\S]*>/i.test(html);
    if (!isHtml) {
        return (
            <div className={`rich-content ${className}`}>
                {html.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="whitespace-pre-line">{para}</p>
                ))}
            </div>
        );
    }

    return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: normalizeLinks(html) }} />;
}
