// Images inside rich text that have no (or blank) alt text
export function countImagesMissingAlt(html = "") {
    const images = html.match(/<img\b[^>]*>/gi) || [];
    return images.filter((tag) => !/\salt="[^"]*\S[^"]*"/i.test(tag)).length;
}

export function richTextAltError(html, fieldName = "content") {
    const missing = countImagesMissingAlt(html);
    return missing
        ? `${missing} image${missing > 1 ? "s" : ""} in the ${fieldName} ${missing > 1 ? "have" : "has"} no alt text. Click the image in the editor, then use the "Alt" button.`
        : "";
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Older records hold plain text; the editor would collapse its line breaks, so
// turn blank-line-separated blocks into paragraphs (single breaks into <br>).
export function toEditorHtml(value = "") {
    if (!value || /<\/?[a-z][\s\S]*>/i.test(value)) return value || "";
    return value
        .split(/\n{2,}/)
        .map((para) => `<p>${escape(para.trim()).replace(/\n/g, "<br>")}</p>`)
        .join("");
}

// True when the editor holds nothing a visitor would see ("<p></p>", spaces).
export function isBlankHtml(html = "") {
    if (/<(img|video)\b/i.test(html)) return false;
    return !html.replace(/<[^>]+>|&nbsp;|\s/g, "");
}
