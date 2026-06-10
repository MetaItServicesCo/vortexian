import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";


export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="flex-grow mt-[120px] md:mt-[122px]">
                {children}
            </main>
            <Footer />
        </>
    );
}