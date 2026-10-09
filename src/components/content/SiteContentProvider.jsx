"use client";

import { createContext, useContext } from "react";
import { resolveAll } from "@/content/registry";

const SiteContentContext = createContext({ content: resolveAll(), footerPages: [], menuServices: [] });

export default function SiteContentProvider({ content, footerPages = [], menuServices = [], children }) {
    return (
        <SiteContentContext.Provider value={{ content, footerPages, menuServices }}>
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

// Services marked "Show in Services menu" (Dashboard → Manage Services)
export function useMenuServices() {
    return useContext(SiteContentContext).menuServices;
}
