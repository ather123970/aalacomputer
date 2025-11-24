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
    </div>
  );
};

export default About;
