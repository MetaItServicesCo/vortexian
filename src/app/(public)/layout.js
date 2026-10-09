import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SocialFloatingButton from "@/components/SocialFloatingButton";
import AdminSiteBar from "@/components/admin/AdminSiteBar";
import SiteSeo from "@/components/seo/SiteSeo";
import SiteContentProvider from "@/components/content/SiteContentProvider";
import { getFooterPages, getMenuServices, getSiteContent } from "@/lib/content";

export default async function PublicLayout({ children }) {
    const [content, footerPages, menuServices] = await Promise.all([getSiteContent(), getFooterPages(), getMenuServices()]);

    return (
        <SiteContentProvider content={content} footerPages={footerPages} menuServices={menuServices}>
            <Navbar />
            <main className="flex-grow mt-[120px] md:mt-[122px]">
                {children}
            </main>
            <SocialFloatingButton />
            <AdminSiteBar />
            <SiteSeo />

            <Footer />
        </SiteContentProvider>
    );
}
