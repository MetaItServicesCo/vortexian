import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SocialFloatingButton from "@/components/SocialFloatingButton";


export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="flex-grow mt-[120px] md:mt-[122px]">
                {children}
            </main>
            <SocialFloatingButton />

            <Footer />
        </>
    );
}