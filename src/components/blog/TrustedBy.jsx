export default function TrustedBy() {
  const logos = [
    "NP Digital",
    "Parul University",
    "Justdial",
    "Quest Global",
    "Healthysure",
    "Mobile Programming",
  ];

  return (
    <section className="bg-white border-y border-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-5">
        <p className="text-center text-xs uppercase tracking-[4px] text-gray-400 mb-8">
          Trusted by leading companies
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center justify-center text-gray-400 font-semibold hover:text-[#6B21D4] transition"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
