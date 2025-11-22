import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Eye, Heart, Music } from 'lucide-react';

export default function VideoCarousel() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef(null);
  const autoScrollTimerRef = useRef(null);

  // Top 3 TikTok videos from @aalacomputers - LIVE EMBEDDED
  const TIKTOK_VIDEOS = [
    {
      id: '7565218063243627794',
      title: '110k PC that runs GTA 5 like a butter 🔥',
      tiktokUrl: 'https://www.tiktok.com/@aalacomputers/video/7565218063243627794',
      embedUrl: 'https://www.tiktok.com/embed/v2/7565218063243627794',
      thumbnail: 'https://p16-sign.tiktokcdn.com/tos-pk-0-0-0/7565218063243627794~c5_1080x1920.jpeg',
      views: 1250000,
      likes: 125400,
      duration: '2:45',
      category: 'Gaming PC',
      badge: 'TRENDING'
    },
    {
      id: '7564110007298477330',
      title: 'Budget Gaming PC Build - 50K PKR 💻',
      tiktokUrl: 'https://www.tiktok.com/@aalacomputers/video/7564110007298477330',
      embedUrl: 'https://www.tiktok.com/embed/v2/7564110007298477330',
      thumbnail: 'https://via.placeholder.com/300x400?text=Budget+Gaming+PC',
      views: 850000,
      likes: 89200,
      duration: '3:20',
      category: 'Budget Build',
      badge: 'POPULAR'
    },
    {
      id: '7564876520519388423',
      title: 'High-End Gaming Rig - RTX 4070 Beast 🚀',
      tiktokUrl: 'https://www.tiktok.com/@aalacomputers/video/7564876520519388423',
      embedUrl: 'https://www.tiktok.com/embed/v2/7564876520519388423',
      thumbnail: 'https://via.placeholder.com/300x400?text=RTX+4070+Gaming+PC',
      views: 1500000,
      likes: 156800,
      duration: '4:15',
      category: 'High-End',
      badge: 'TOP PICK'
    }
  ];

  // Fetch videos from database OR use TikTok videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Use only top 3 TikTok videos (no duplication)
        setVideos(TIKTOK_VIDEOS);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Auto-scroll effect (continuous auto-running)
  useEffect(() => {
    if (videos.length === 0) return;

    autoScrollTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        // Reset to beginning when reaching the end for infinite loop
        if (nextIndex >= videos.length) {
          return 0;
        }
        return nextIndex;
      });
    }, 5000); // Change video every 5 seconds

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [videos.length]);

  // Hide related videos in TikTok embeds
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Container clips related videos */
      .video-embed-container {
        max-height: 384px;
        overflow: hidden;
      }
      
      /* Hide TikTok related section */
      [data-tiktok-related],
      .tiktok-related,
      .related-videos {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Scroll to current index
  useEffect(() => {
    if (scrollContainerRef.current && videos.length > 0) {
      const scrollAmount = currentIndex * 320; // Card width + gap
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, videos.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">
            Our Social Media Videos
          </h2>
          <div className="flex justify-center gap-4 text-sm text-blue-600 mb-4">
            <span className="hover:text-blue-800 cursor-pointer transition">TikTok</span>
            <span>•</span>
            <span className="hover:text-blue-800 cursor-pointer transition">Insta</span>
            <span>•</span>
            <span className="hover:text-blue-800 cursor-pointer transition">YouTube</span>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Videos Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 md:overflow-x-hidden"
            style={{
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory'
            }}
          >
            {videos.map((video, index) => (
              <div
                key={`${video.id}-${index}`}
                className="flex-shrink-0 w-full md:w-80 group/card relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* TikTok Embedded Video */}
                <div className="relative bg-blue-100 overflow-hidden video-embed-container h-96 md:h-[600px]">
                  {/* Embedded TikTok Video - No Related Videos */}
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${video.id}?related=false`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 'none', display: 'block' }}
                    scrolling="no"
                  />

                  {/* Fallback Thumbnail if embed fails */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover hidden group-hover/card:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/320x400?text=TikTok+Video';
                    }}
                  />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-blue-600/90 text-white font-bold px-3 py-1 rounded-full text-xs shadow-lg z-10">
                    {video.category}
                  </div>

                  {/* TikTok Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
                    <Music className="w-3 h-3" />
                    TikTok
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4 bg-white border-t border-blue-200">
                  {/* Title */}
                  <h3 className="text-blue-900 font-bold text-sm mb-3 line-clamp-2 group-hover/card:text-blue-600 transition-colors">
                    {video.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-blue-600 text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{(video.views / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-blue-500 fill-blue-500" />
                      <span>{(video.likes / 1000).toFixed(1)}K</span>
                    </div>
                  </div>

                  {/* Watch on TikTok Button */}
                  <a
                    href={video.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-2 px-3 rounded-lg transition-all text-xs text-center flex items-center justify-center gap-1"
                  >
                    <Music className="w-3 h-3" />
                    Watch on TikTok
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Hidden on mobile */}
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-12 z-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-12 z-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 w-8'
                  : 'bg-blue-200 w-2 hover:bg-blue-300'
              }`}
            />
          ))}
        </div>

        {/* Auto-scroll indicator */}
        <div className="text-center mt-6 text-blue-600 text-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="font-semibold">Auto-running videos...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
