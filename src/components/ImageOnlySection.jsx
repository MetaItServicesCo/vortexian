import React from "react";

const ImageOnlySection = () => {
  return (
    // FIXED: h-screen ko remove kiya taake height image ke mutabiq auto-extend ho, aur bg ko image ke white color se match kar diya
    <section className="w-full h-auto bg-white overflow-visible flex items-start justify-center">
      <img
        src="/assets/images/rrrrrr.png"
        alt="Vortexian Tech Banner Showcase"
        // FIXED: w-full se image left aur right se 100% full width stretch ho jayegi edge-to-edge
        // max-w-[1920px] lagaya hai taake 4K screens par image bilkul fat na jaye
        className="w-full max-w-[1920px] h-auto object-cover block"
      />
    </section>
  );
};

export default ImageOnlySection;
