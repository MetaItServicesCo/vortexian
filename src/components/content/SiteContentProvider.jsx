"use client";

import { createContext, useContext } from "react";
import { resolveAll } from "@/content/registry";

const SiteContentContext = createContext({ content: resolveAll(), footerPages: [] });

export default function SiteContentProvider({ content, footerPages = [], children }) {
    return (
        <SiteContentContext.Provider value={{ content, footerPages }}>
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
