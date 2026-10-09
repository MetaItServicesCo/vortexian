import UnsubscribeForm from "@/components/newsletter/UnsubscribeForm";

export const metadata = {
    title: "Unsubscribe",
    robots: { index: false, follow: false },
};

// Opened from the Unsubscribe link in newsletter emails
export default async function UnsubscribePage({ searchParams }) {
    const { token } = await searchParams;
    return (
        <section className="px-4 py-24">
            <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
                <h1 className="text-2xl font-black text-[#1D1D7E]">Newsletter</h1>
                <UnsubscribeForm token={typeof token === "string" ? token : ""} />
            </div>
        </section>
    );
}
