// Links whose target is an image file (e.g. "/uploads/media/x.png"). On the
// website these open in a pop-up viewer (ImageLinkLightbox) instead of a bare
// image page. Keep the extensions in sync with the CSS icon in globals.css.
const IMAGE_FILE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

export function isImageHref(href = "") {
    if (!href) return false;
    try {
        return IMAGE_FILE.test(new URL(href, "https://x.invalid").pathname);
    } catch {
        return false;
    }
}
