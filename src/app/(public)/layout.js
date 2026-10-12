import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FloatingCallButton from "@/components/FloatingCallButton";
import AdminSiteBar from "@/components/admin/AdminSiteBar";
import SiteSeo from "@/components/seo/SiteSeo";
import ImageLinkLightbox from "@/components/content/ImageLinkLightbox";
import ChatWidget from "@/components/ai/ChatWidget";
import SiteContentProvider from "@/components/content/SiteContentProvider";
import { getFooterPages, getServicesMenu, getSiteContent } from "@/lib/content";

export default async function PublicLayout({ children }) {
    const [content, footerPages, servicesMenu] = await Promise.all([getSiteContent(), getFooterPages(), getServicesMenu()]);

    return (
        <SiteContentProvider content={content} footerPages={footerPages} servicesMenu={servicesMenu}>
            <Navbar />
            <main className="flex-grow mt-[120px] md:mt-[122px]">
                {children}
            </main>
            <FloatingCallButton />
            <AdminSiteBar />
            <SiteSeo />
            <ImageLinkLightbox />
            <ChatWidget />

            <Footer />
        </SiteContentProvider>
    );
}
