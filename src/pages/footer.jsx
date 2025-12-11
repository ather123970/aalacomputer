import React, { useState, useEffect } from "react";
import { Facebook, Instagram, Twitter, Youtube, ArrowUp } from "lucide-react";

// TikTok icon component since it's not in lucide-react
const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.33 6.33 0 0 0 10.86-4.43V7.83a8.24 8.24 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.2-.26z"/>
  </svg>
);

const Footer = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowTopBtn(true);
      else setShowTopBtn(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Footer */}
      <footer className="bg-white text-gray-900 py-16 px-6 md:px-20 relative border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          {/* Brand Section */}
          <div className="md:w-1/3 space-y-4">
            <h1 className="text-3xl font-extrabold text-blue-600">
              Aala Computers
            </h1>

            <p className="text-gray-600 text-sm leading-relaxed">
              Building your dream PCs with precision. From budget builds to
              extreme setups — we deliver performance, reliability, and design
              that stands out.
            </p>

          </div>

          {/* Quick Links */}
          <div className="md:w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-blue-600 relative inline-block">
              Quick Links
              <span className="absolute left-0 -bottom-1 w-16 h-[2px] bg-blue-600"></span>
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                { name: "Home", href: "#home" },
                { name: "About", href: "#about" },
                { name: "Contact", href: "#contact" },
                { name: "Category", href: "#category" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:w-1/3 space-y-3">
            <h2 className="text-xl font-semibold mb-2 text-blue-600 relative inline-block">
              Contact
              <span className="absolute left-0 -bottom-1 w-16 h-[2px] bg-blue-600"></span>
            </h2>
            <p className="text-gray-700 text-sm">
              123 Tech Street, Karachi, Pakistan
            </p>
            <p className="text-gray-700 text-sm">
              Email:{" "}
              <a
                href="mailto:info@aalacomputers.com"
                className="hover:text-blue-600"
              >
                info@aalacomputers.com
              </a>
            </p>
            <p className="text-gray-700 text-sm">
              Phone:{" "}
              <a href="tel:+923001234567" className="hover:text-blue-600">
                +92 300 1234567
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 mt-10 pt-5 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-blue-600 font-semibold">Aala Computers</span>.
          All rights reserved.
        </div>
      </footer>

      {/* Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg animate-bounce transition-transform duration-300 hover:scale-110"
          aria-label="Back to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default Footer;
