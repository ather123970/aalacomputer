import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Volume2, VolumeX } from 'lucide-react';

export default function VideoShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const videoRefs = useRef([]);

  // Your local videos from heroimg folder
  const videos = [
    {
      id: 1,
      title: "110k PC that runs GTA 5 like a butter 🔥",
      src: "/heroimg/ssstik.io_@aalacomputers_1764488159826.mp4",
      views: "1.25M",
      likes: "125.4K"
    },
    {
      id: 2,
      title: "Budget Gaming PC Build - 50K PKR 💻",
      src: "/heroimg/ssstik.io_@aalacomputers_1764488186318.mp4",
      views: "850K",
      likes: "89.2K"
    },
    {
      id: 3,
      title: "High-End Gaming Rig - RTX 4070 Beast 🚀",
      src: "/heroimg/ssstik.io_@aalacomputers_1764488206401.mp4",
      views: "1.5M",
      likes: "156.8K"
    }
  ];

  // Stop all videos except current one
  const stopAllVideos = (exceptIndex) => {
    videoRefs.current.forEach((video, idx) => {
      if (video && idx !== exceptIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  // Play current video with audio always on
  const playCurrentVideo = (index) => {
    stopAllVideos(index);
    const video = videoRefs.current[index];
    if (video) {
      // Always unmuted - audio always on
      video.muted = false;

      // Force autoplay with multiple attempts
      const attemptPlay = async () => {
        try {
          await video.play();
          console.log('Video autoplay successful with audio');
        } catch (err) {
          console.log('Auto-play failed, trying with user interaction:', err);
          // Try to trigger user interaction for autoplay
          video.play().catch(e => console.log('Autoplay with audio failed:', e));
        }
      };
      attemptPlay();
    }
  };

  // Handle scroll to change video
  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 400; // Approximate card width
    const newIndex = Math.round(scrollLeft / cardWidth);

    if (newIndex !== currentIndex && newIndex < videos.length) {
      setCurrentIndex(newIndex);
      playCurrentVideo(newIndex);
    }
  };

  // Auto-play when component mounts and when current index changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      playCurrentVideo(currentIndex);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Force play on mount with additional attempts
  useEffect(() => {
    const forcePlayOnMount = () => {
      // Try multiple times to ensure video plays
      const attempts = [500, 1000, 2000, 3000]; // Delays in ms

      attempts.forEach((delay, index) => {
        setTimeout(() => {
          const video = videoRefs.current[currentIndex];
          if (video && video.paused) {
            console.log(`Force play attempt ${index + 1} at ${delay}ms`);
            playCurrentVideo(currentIndex);
          }
        }, delay);
      });
    };

    forcePlayOnMount();
  }, []); // Only run once on mount

  // Intersection Observer for autoplay when video is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoIndex = parseInt(entry.target.dataset.videoIndex);
            if (!isNaN(videoIndex) && videoIndex === currentIndex) {
              // Add a small delay to ensure smooth transition
              setTimeout(() => {
                playCurrentVideo(videoIndex);
              }, 100);
            }
          } else {
            // Pause video when out of view
            const videoIndex = parseInt(entry.target.dataset.videoIndex);
            if (!isNaN(videoIndex)) {
              const video = videoRefs.current[videoIndex];
              if (video && !video.paused) {
                video.pause();
              }
            }
          }
        });
      },
      {
        threshold: 0.3, // Play when 30% of video is visible
        rootMargin: '0px'
      }
    );

    // Observe all video elements
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.dataset.videoIndex = index;
        observer.observe(video);
      }
    });

    return () => observer.disconnect();
  }, [currentIndex]);

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

        {/* Video Carousel - Scroll Based */}
        <div className="relative mb-8 md:mb-12">
          {/* Main Carousel Container */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
            {/* Horizontal Scroll Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
              style={{
                scrollBehavior: 'smooth',
                scrollSnapType: 'x mandatory'
              }}
            >
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex-shrink-0 w-full md:w-96 relative overflow-hidden rounded-xl snap-start"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {/* Video Player */}
                  <div className="relative bg-slate-900 overflow-hidden" style={{ aspectRatio: '9/16', minHeight: '500px' }}>
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current[index] = el;
                      }}
                      src={video.src}
                      className="w-full h-full object-cover"
                      muted={false}
                      loop
                      playsInline
                      autoPlay
                      controls={false}
                      preload="metadata"
                      onClick={() => {
                        const video = videoRefs.current[index];
                        if (video) {
                          if (video.paused) {
                            video.play();
                          } else {
                            video.pause();
                          }
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />

                    {/* Play/Pause Overlay */}
                    <div className="absolute top-4 left-4 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = videoRefs.current[index];
                          if (video) {
                            if (video.paused) {
                              video.play();
                            } else {
                              video.pause();
                            }
                          }
                        }}
                        className="bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        aria-label="Play/Pause"
                      >
                        {videoRefs.current[index]?.paused ? (
                          <span className="text-lg">▶️</span>
                        ) : (
                          <span className="text-lg">⏸️</span>
                        )}
                      </button>
                    </div>

                    {/* Audio Indicator */}
                    <div className="absolute top-4 right-4 z-20 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span>🔊</span>
                      Audio On
                    </div>

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex gap-3 text-white text-xs">
                        <span>👁️ {video.views}</span>
                        <span>❤️ {video.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Hint */}
          <div className="text-center mt-4 text-slate-600 text-sm">
            <p>← Scroll to view more videos →</p>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {videos.map((_, index) => (
              <button
                key={index}
                className={`transition-all ${index === currentIndex
                    ? 'w-8 h-3 bg-blue-600'
                    : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                  } rounded-full`}
                aria-label={`Video ${index + 1}`}
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
