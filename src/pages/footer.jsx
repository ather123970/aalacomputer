import React, { useState, useEffect } from "react";
import { Facebook, Instagram, Twitter, Youtube, ArrowUp } from "lucide-react";

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
      <footer className="bg-gradient-to-b from-black via-gray-900 to-black text-white py-14 px-6 md:px-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          {/* Brand Section */}
          <div className="md:w-1/3 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://seeklogo.com/images/A/Ala-logo-9A7F5A0E9F-seeklogo.com.png"
                alt="Aala Computers Logo"
                className="w-10 h-10 rounded-full bg-white p-1"
              />
              <h1 className="text-2xl font-extrabold text-blue-500">
                Aala Computers
              </h1>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Building your dream PCs with precision. From budget builds to
              extreme setups — we deliver performance, reliability, and design
              that stands out.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-3">
              {[
                { Icon: Facebook, color: "hover:text-blue-500" },
                { Icon: Instagram, color: "hover:text-pink-500" },
                { Icon: Twitter, color: "hover:text-sky-400" },
                { Icon: Youtube, color: "hover:text-red-500" },
              ].map(({ Icon, color }, i) => (
                <a
                  key={i}
                  href="#"
                  className={`p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors ${color}`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-blue-500 relative inline-block">
              Quick Links
              <span className="absolute left-0 -bottom-1 w-16 h-[2px] bg-blue-500"></span>
            </h2>
            <ul className="space-y-2 text-gray-400">
              {[
                { name: "Home", href: "#home" },
                { name: "About", href: "#about" },
                { name: "Contact", href: "#contact" },
                { name: "Category", href: "#category" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:w-1/3 space-y-3">
            <h2 className="text-xl font-semibold mb-2 text-blue-500 relative inline-block">
              Contact
              <span className="absolute left-0 -bottom-1 w-16 h-[2px] bg-blue-500"></span>
            </h2>
            <p className="text-gray-400 text-sm">
              123 Tech Street, Karachi, Pakistan
            </p>
            <p className="text-gray-400 text-sm">
              Email:{" "}
              <a
                href="mailto:info@aalacomputers.com"
                className="hover:text-blue-400"
              >
                info@aalacomputers.com
              </a>
            </p>
            <p className="text-gray-400 text-sm">
              Phone:{" "}
              <a href="tel:+923001234567" className="hover:text-blue-400">
                +92 300 1234567
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-10 pt-5 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-blue-400 font-semibold">Aala Computers</span>.
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
