"use client";

// Website <-> Dashboard toggle for logged-in admins.
// Switching returns to the page you were last on in the other mode; the first
// time, it opens the matching section instead (Blog <-> /blog etc.).

const LAST_SITE = "admin:lastSitePath";
const LAST_DASHBOARD = "admin:lastDashboardPath";

const read = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};
const write = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // storage blocked (private mode): the fallbacks below still work
    }
};

export const rememberSitePath = (path) => write(LAST_SITE, path);
export const rememberDashboardPath = (path) => write(LAST_DASHBOARD, path);

// [dashboard prefix, website path]
const SECTIONS = [
    ["/dashboard/blog", "/blog"],
    ["/dashboard/newsfeed", "/news"],
    ["/dashboard/services", "/services"],
    ["/dashboard/portfolio", "/portfolio"],
    ["/dashboard/career", "/career"],
    ["/dashboard/team", "/about"],
    ["/dashboard/content/page.about", "/about"],
    ["/dashboard/content/page.contact", "/contact"],
    ["/dashboard/content/page.career", "/career"],
    ["/dashboard/content/page.services", "/services"],
    ["/dashboard/content/page.portfolio", "/portfolio"],
    ["/dashboard/content/page.blog", "/blog"],
    ["/dashboard/content/page.news", "/news"],
];

const matches = (path, prefix) => path === prefix || path.startsWith(prefix + "/") || path.startsWith(prefix + "?");

export function siteHrefFor(dashboardPath) {
    const last = read(LAST_SITE);
    if (last && last.startsWith("/") && !last.startsWith("/dashboard")) return last;
    const hit = SECTIONS.find(([dash]) => matches(dashboardPath, dash));
    return hit ? hit[1] : "/";
}

// [website prefix, dashboard section]
const SITE_SECTIONS = [
    ["/blog", "/dashboard/blog"],
    ["/news", "/dashboard/newsfeed"],
    ["/services", "/dashboard/services"],
    ["/portfolio", "/dashboard/portfolio"],
    ["/career", "/dashboard/career"],
    ["/about", "/dashboard/content"],
    ["/contact", "/dashboard/content"],
];

export function dashboardHrefFor(sitePath) {
    const last = read(LAST_DASHBOARD);
    if (last && last.startsWith("/dashboard")) return last;
    if (sitePath === "/") return "/dashboard";
    const hit = SITE_SECTIONS.find(([site]) => matches(sitePath, site));
    return hit ? hit[1] : "/dashboard/pages"; // anything else is a custom page (e.g. /privacy-policy)
}
