import React, { useState } from 'react';
import { motion as FM, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Navbar from './nav';

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, number, message } = formData;

    // Construct WhatsApp message
    const whatsappMessage = `Hello, I have a message from your website:\n\nName: ${name}\nEmail: ${email}\nPhone: ${number}\nMessage: ${message}`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(whatsappMessage);

    // WhatsApp link
    const whatsappNumber = '923125066195'; // without '+'
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
  };

  // Animation controls
  const aboutControls = useAnimation();
  const contactControls = useAnimation();

  const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [contactRef, contactInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  if (aboutInView) aboutControls.start({ x: 0, opacity: 1 });
  if (contactInView) contactControls.start({ y: 0, opacity: 1 });

  return (
    <div className="bg-black text-white relative z-[1]">
      <Navbar />

      {/* About & Contact Section */}
      <section id="about" className="py-20 px-6 md:px-20 relative z-[1]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">

          {/* About Section */}
          <FM.div
            ref={aboutRef}
            initial={{ x: 100, opacity: 0 }}
            animate={aboutControls}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="md:w-1/2 space-y-6 will-change-transform relative z-[2]"
            style={{ transformStyle: 'flat' }}
          >
            <h1 className="text-5xl font-bold text-blue-500">About Us</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              At <span className="text-blue-500 font-semibold">Aala Computers</span>, we don’t just sell PCs — we build dreams.
              Whether you want a powerful custom setup, pre-built performance rig, or quality computer parts, we’ve got you covered.
              Every build is tuned for speed, style, and reliability — made for gamers, creators, and everyday legends.
            </p>

            {/* Social Icons */}
            <div className="flex gap-6 mt-4">
              <FM.a whileHover={{ scale: 1.2 }} href="#" className="hover:text-blue-500"><Facebook /></FM.a>
              <FM.a whileHover={{ scale: 1.2 }} href="#" className="hover:text-pink-500"><Instagram /></FM.a>
              <FM.a whileHover={{ scale: 1.2 }} href="#" className="hover:text-sky-400"><Twitter /></FM.a>
              <FM.a whileHover={{ scale: 1.2 }} href="#" className="hover:text-red-500"><Youtube /></FM.a>
            </div>
          </FM.div>

          {/* Contact Form */}
          <FM.div
            ref={contactRef}
            initial={{ y: 100, opacity: 0 }}
            animate={contactControls}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="md:w-1/2 bg-gray-900/50 rounded-2xl p-6 md:p-10 shadow-lg relative z-[2]"
            style={{ transformStyle: 'flat' }}
          >
            <h1 className="text-4xl font-bold text-blue-500 mb-6">Contact Us</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FM.input
                whileHover={{ scale: 1.02 }}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-3 rounded-md bg-transparent border-2 border-blue-700 focus:outline-none text-white"
                required
              />
              <FM.input
                whileHover={{ scale: 1.02 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 rounded-md bg-transparent border-2 border-blue-700 focus:outline-none text-white"
                required
              />
              <FM.input
                whileHover={{ scale: 1.02 }}
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-3 rounded-md bg-transparent border-2 border-blue-700 focus:outline-none text-white"
                required
              />
              <FM.textarea
                whileHover={{ scale: 1.02 }}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                className="w-full h-40 p-3 rounded-md bg-transparent border-2 border-blue-700 focus:outline-none text-white resize-none"
                required
              />

              <FM.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md mt-4"
              >
                Submit
              </FM.button>
            </form>
          </FM.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white py-12 px-6 md:px-20 mt-20 border-t border-gray-700 relative z-[1]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">

          {/* Brand / About */}
          <div className="md:w-1/3 space-y-4">
            <h1 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
              Aala Computers
            </h1>
            <p className="text-gray-400 text-sm">
              We build your dream PCs. Pre-Built, Custom Builds, and top-quality parts for gamers, creators, and professionals.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              <a href="#" className="hover:text-blue-500"><Facebook /></a>
              <a href="#" className="hover:text-pink-500"><Instagram /></a>
              <a href="#" className="hover:text-sky-400"><Twitter /></a>
              <a href="#" className="hover:text-red-500"><Youtube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-blue-500">Quick Links</h2>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#home" className="hover:text-blue-400">Home</a></li>
              <li><a href="#about" className="hover:text-blue-400">About</a></li>
              <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
              <li><a href="#category" className="hover:text-blue-400">Category</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:w-1/3 space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-blue-500">Contact</h2>
            <p className="text-gray-400 text-sm">123 Tech Street, Karachi, Pakistan</p>
            <p className="text-gray-400 text-sm">Email: info@aalacomputers.com</p>
            <p className="text-gray-400 text-sm">Phone: +92 300 1234567</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Aala Computers. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default About;
