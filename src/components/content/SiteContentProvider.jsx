"use client";

import { createContext, useContext } from "react";
import { resolveAll } from "@/content/registry";

const SiteContentContext = createContext({ content: resolveAll(), footerPages: [], servicesMenu: [] });

export default function SiteContentProvider({ content, footerPages = [], servicesMenu = [], children }) {
    return (
        <SiteContentContext.Provider value={{ content, footerPages, servicesMenu }}>
            {children}
        </SiteContentContext.Provider>
    );
}

export function useContent(key) {
    return useContext(SiteContentContext).content[key];
}

export function useSettings() {
    return useContent("settings");
}

export function useFooterPages() {
    return useContext(SiteContentContext).footerPages;
}

// Services dropdown grouped by category (Dashboard → Categories / Manage Services)
export function useServicesMenu() {
    return useContext(SiteContentContext).servicesMenu;
}
