import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function VideoShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Your local videos from heroimg folder
  const videos = [
    {
      id: 1,
      title: "110k PC that runs GTA 5 like a butter 🔥",
      src: "/heroimg/midvideotoshow.mp4",
      views: "1.25M",
      likes: "125.4K"
    },
    {
      id: 2,
      title: "Budget Gaming PC Build - 50K PKR 💻",
      src: "/heroimg/2ndvideo (1).mp4",
      views: "850K",
      likes: "89.2K"
    },
    {
      id: 3,
      title: "High-End Gaming Rig - RTX 4070 Beast 🚀",
      src: "/heroimg/3rdimg.mp4",
      views: "1.5M",
      likes: "156.8K"
    }
  ];


  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const handleTikTokClick = () => {
    window.open('https://www.tiktok.com/@aalacomputers', '_blank');
  };


  return (
    <div className="w-full bg-gradient-to-br from-white via-blue-50 to-slate-50 py-12 md:py-16 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2 md:mb-4">
            Our Social Media Videos
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            TikTok, Instagram, YouTube
          </p>
        </div>

        {/* Video Carousel */}
        <div className="relative mb-8 md:mb-12">
          {/* Main Carousel Container */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
            {/* Videos Container */}
            <div className="relative w-full bg-slate-900" style={{ aspectRatio: '9/16', maxHeight: '600px' }}>
              {/* Video Slides */}
              <div className="relative w-full h-full flex items-center justify-center">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Local Video Player */}
                    <video
                      src={video.src}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      controls
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Previous video"
              >
                <ChevronLeft size={20} className="md:w-6 md:h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Next video"
              >
                <ChevronRight size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            {/* Video Info */}
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 md:p-6 border-t border-blue-200">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                {videos[currentIndex].title}
              </h3>
              <div className="flex gap-4 md:gap-6 text-sm md:text-base text-slate-600">
                <span>👁️ {videos[currentIndex].views} views</span>
                <span>❤️ {videos[currentIndex].likes} likes</span>
              </div>
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-blue-600'
                    : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                } rounded-full`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>

        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={handleTikTokClick}
            className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
          >
            <span className="text-lg md:text-xl">🎵</span>
            Watch Our TikTok
            <ExternalLink size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
