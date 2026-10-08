// Public URL of a blog post: /blog/<slug> (falls back to the id for old data)
export function blogPath(post) {
    return `/blog/${post?.slug || post?.id}`;
}
