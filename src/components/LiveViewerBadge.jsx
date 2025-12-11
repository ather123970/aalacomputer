import React, { useState, useEffect } from 'react';
import { getLiveViewerCount } from '../utils/visitorTracking';

export default function LiveViewerBadge() {
  const [liveViewers, setLiveViewers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveViewers = async () => {
      try {
        const count = await getLiveViewerCount();
        setLiveViewers(count);
      } catch (error) {
        console.warn('Failed to fetch live viewers:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchLiveViewers();

    // Refresh every 10 seconds
    const interval = setInterval(fetchLiveViewers, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-[9998]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-semibold">
          {liveViewers} {liveViewers === 1 ? 'person' : 'people'} watching
        </span>
      </div>
    </div>
  );
}
