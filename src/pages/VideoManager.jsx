import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, Heart, Save, X } from 'lucide-react';

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    videoUrl: '',
    category: '',
    views: 0,
    likes: 0,
    duration: ''
  });

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = () => {
    setFormData({
      title: '',
      thumbnail: '',
      videoUrl: '',
      category: '',
      views: 0,
      likes: 0,
      duration: ''
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditVideo = (video) => {
    setFormData(video);
    setEditingId(video.id);
    setShowForm(true);
  };

  const handleSaveVideo = () => {
    if (!formData.title || !formData.thumbnail || !formData.videoUrl) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedVideos;
    if (editingId) {
      updatedVideos = videos.map(v => v.id === editingId ? { ...formData, id: editingId } : v);
    } else {
      updatedVideos = [...videos, { ...formData, id: String(videos.length + 1) }];
    }

    // Save to backend (you can implement this endpoint)
    setVideos(updatedVideos);
    setShowForm(false);
    setFormData({
      title: '',
      thumbnail: '',
      videoUrl: '',
      category: '',
      views: 0,
      likes: 0,
      duration: ''
    });
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Video Manager</h1>
          <button
            onClick={handleAddVideo}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Video
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? 'Edit Video' : 'Add New Video'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Video title"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Thumbnail URL *</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Image URL"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Video URL *</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="YouTube/TikTok URL"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., Gaming PC"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., 3:45"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Views</label>
                    <input
                      type="number"
                      value={formData.views}
                      onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Likes</label>
                    <input
                      type="number"
                      value={formData.likes}
                      onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveVideo}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Save Video
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-700 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Video';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleEditVideo(video)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                  {video.title}
                </h3>

                <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
                  <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded">
                    {video.category || 'Uncategorized'}
                  </span>
                  {video.duration && (
                    <span className="bg-gray-700 px-2 py-1 rounded">
                      {video.duration}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-gray-400 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{(video.views / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span>{(video.likes / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No videos yet</p>
            <button
              onClick={handleAddVideo}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
