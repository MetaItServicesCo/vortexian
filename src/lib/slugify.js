// URL-safe slug, matching backend/app/sanitize.py: "Sit necessitatibus " -> "sit-necessitatibus"
export function slugify(text = "") {
    return text
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 150)
        .replace(/-+$/, "");
}

// While typing, keep a trailing hyphen so "web " can become "web-design"
export function slugifyTyping(text = "") {
    const endsWithSeparator = /[^a-zA-Z0-9]$/.test(text);
    const slug = slugify(text);
    return endsWithSeparator && slug ? `${slug}-` : slug;
}
