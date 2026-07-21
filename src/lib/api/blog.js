const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const handleRes = async (res) => {
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new Error(raw || `Request failed: ${res.status}`);
  }
  return res.json().catch(() => null);
};

// featured_image is stored as a relative path (/uploads/x.jpg). Left as-is it
// resolves against the Next app (localhost:3000) and 404s, so point it at the API.
export const blogImageUrl = (path) => {
  if (!path) return null;
  const p = String(path);
  if (p.startsWith("http")) return p;
  return `${API_URL.replace(/\/$/, "")}/${p.replace(/^\/+/, "")}`;
};

// Public — no auth needed
export const getPublicBlogs = () =>
  fetch(`${API_URL}/api/blog/public`).then(handleRes);

export const getBlogById = (blogId) =>
  fetch(`${API_URL}/api/blog/${blogId}`).then(handleRes);
