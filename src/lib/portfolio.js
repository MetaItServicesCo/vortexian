// Public URL of a portfolio project: /portfolio/<slug> (falls back to the id for old data)
export function portfolioPath(project) {
    return `/portfolio/${project?.slug || project?.id}`;
}
