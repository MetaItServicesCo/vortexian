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
