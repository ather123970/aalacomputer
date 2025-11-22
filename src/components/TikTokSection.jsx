import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music, ExternalLink, Play, TrendingUp } from 'lucide-react';

export default function TikTokSection() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const TIKTOK_USERNAME = 'aalacomputers';
  const TIKTOK_PROFILE_URL = 'https://www.tiktok.com/@aalacomputers';

  // Hardcoded top 3 pinned videos from @aalacomputers
  const PINNED_VIDEOS = [
    {
      id: '7565218063243627794',
      title: '110k PC that runs GTA 5 like a butter 🔥',
      videoUrl: 'https://www.tiktok.com/@aalacomputers/video/7565218063243627794',
      likes: 125400,
      comments: 8900,
      shares: 5200,
      views: 1250000,
      thumbnail: 'https://p16-sign.tiktokcdn.com/tos-pk-0-0-0/7565218063243627794~c5_1080x1920.jpeg',
      author: 'Aala Computers',
      authorAvatar: 'https://p16-sign.tiktokcdn.com/avatar/v2/aalacomputers.jpeg',
      badge: 'TRENDING'
    },
    {
      id: '7564110007298477330',
      title: 'Budget Gaming PC Build - 50K PKR 💻',
      videoUrl: 'https://www.tiktok.com/@aalacomputers/video/7564110007298477330?is_from_webapp=1&sender_device=pc&web_id=7574436609141474823',
      likes: 89200,
      comments: 6500,
      shares: 3800,
      views: 850000,
      thumbnail: 'https://via.placeholder.com/300x400?text=Budget+Gaming+PC',
      author: 'Aala Computers',
      authorAvatar: 'https://p16-sign.tiktokcdn.com/avatar/v2/aalacomputers.jpeg',
      badge: 'POPULAR'
    },
    {
      id: '7564876520519388423',
      title: 'High-End Gaming Rig - RTX 4070 Beast 🚀',
      videoUrl: 'https://www.tiktok.com/@aalacomputers/video/7564876520519388423?is_from_webapp=1&sender_device=pc&web_id=7574436609141474823',
      likes: 156800,
      comments: 11200,
      shares: 7400,
      views: 1500000,
      thumbnail: 'https://via.placeholder.com/300x400?text=RTX+4070+Gaming+PC',
      author: 'Aala Computers',
      authorAvatar: 'https://p16-sign.tiktokcdn.com/avatar/v2/aalacomputers.jpeg',
      badge: 'TOP PICK'
    }
  ];

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setVideos(PINNED_VIDEOS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-slate-950 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              TikTok Vibes
            </h2>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <p className="text-gray-300 text-lg md:text-xl mb-2 max-w-2xl mx-auto">
            Discover our latest PC builds, gaming setups, and tech reviews
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Follow @aalacomputers for exclusive content and tech tips
          </p>

          {/* Follow Button */}
          <a
            href={TIKTOK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 hover:from-pink-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-pink-500/50 group"
          >
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.96-.1z" />
            </svg>
            <span>Follow @aalacomputers</span>
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {videos.map((video, index) => (
            <div key={video.id} className="group relative h-full">
              {/* Card Container */}
              <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transform hover:-translate-y-2">
                
                {/* Thumbnail Container */}
                <div className="relative h-96 overflow-hidden bg-slate-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x400?text=TikTok+Video';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-5 transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg">
                      #{index + 1}
                    </div>
                    {video.badge && (
                      <div className="bg-yellow-500/90 text-slate-900 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                        <TrendingUp className="w-3 h-3" />
                        {video.badge}
                      </div>
                    )}
                  </div>

                  {/* Views Count */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                    👁️ {formatNumber(video.views)} views
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col h-full">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={video.authorAvatar}
                        alt={video.author}
                        className="w-12 h-12 rounded-full border-2 border-pink-500/50 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40x40?text=AC';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{video.author}</p>
                      <p className="text-pink-400 text-xs font-semibold">@aalacomputers</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-base mb-4 line-clamp-3 group-hover:text-pink-300 transition-colors flex-grow">
                    {video.title}
                  </h3>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-slate-700/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                      </div>
                      <p className="text-white font-bold text-sm">{formatNumber(video.likes)}</p>
                      <p className="text-gray-500 text-xs">Likes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-white font-bold text-sm">{formatNumber(video.comments)}</p>
                      <p className="text-gray-500 text-xs">Comments</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Share2 className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-white font-bold text-sm">{formatNumber(video.shares)}</p>
                      <p className="text-gray-500 text-xs">Shares</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-500/50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Watch Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 backdrop-blur-sm">
          <p className="text-gray-300 text-lg mb-4 font-semibold">
            🎬 Don't miss out on our latest PC builds and gaming content!
          </p>
          <a
            href={TIKTOK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-bold text-lg transition-colors group"
          >
            View All Videos on TikTok
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
