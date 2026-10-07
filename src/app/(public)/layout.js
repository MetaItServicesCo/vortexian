import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SocialFloatingButton from "@/components/SocialFloatingButton";
import SiteContentProvider from "@/components/content/SiteContentProvider";
import { getFooterPages, getSiteContent } from "@/lib/content";

export default async function PublicLayout({ children }) {
    const [content, footerPages] = await Promise.all([getSiteContent(), getFooterPages()]);

    return (
        <SiteContentProvider content={content} footerPages={footerPages}>
            <Navbar />
            <main className="flex-grow mt-[120px] md:mt-[122px]">
                {children}
            </main>
            <SocialFloatingButton />

            <Footer />
        </SiteContentProvider>
    );
}
