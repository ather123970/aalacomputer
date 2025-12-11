// Visitor Tracking Utility
// Tracks real website visitors and live viewers

const VISITOR_KEY = 'aala_visitor_id';
const VISITOR_TIMESTAMP_KEY = 'aala_visitor_timestamp';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes session

/**
 * Get or create a unique visitor ID
 */
export const getVisitorId = () => {
  let visitorId = localStorage.getItem(VISITOR_KEY);
  const timestamp = localStorage.getItem(VISITOR_TIMESTAMP_KEY);
  const now = Date.now();

  // If no visitor ID or session expired, create new one
  if (!visitorId || !timestamp || (now - parseInt(timestamp)) > SESSION_DURATION) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(VISITOR_KEY, visitorId);
    localStorage.setItem(VISITOR_TIMESTAMP_KEY, now.toString());
  } else {
    // Update timestamp to extend session
    localStorage.setItem(VISITOR_TIMESTAMP_KEY, now.toString());
  }

  return visitorId;
};

/**
 * Track a page view (silent - no console output)
 */
export const trackPageView = async (pageName = 'home') => {
  try {
    const visitorId = getVisitorId();
    const baseURL = import.meta.env.DEV
      ? 'http://localhost:10000'
      : window.location.origin;

    await fetch(`${baseURL}/api/v1/analytics/page-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        pageName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }),
    }).catch(() => {
      // Silently ignore errors
    });
  } catch (error) {
    // Silently ignore errors
  }
};

/**
 * Track user action (click, add to cart, etc.) - silent
 */
export const trackUserAction = async (action, data = {}) => {
  try {
    const visitorId = getVisitorId();
    const baseURL = import.meta.env.DEV
      ? 'http://localhost:10000'
      : window.location.origin;

    await fetch(`${baseURL}/api/v1/analytics/user-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        action,
        data,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently ignore errors
    });
  } catch (error) {
    // Silently ignore errors
  }
};

/**
 * Get visitor statistics - silent
 */
export const getVisitorStats = async () => {
  try {
    const baseURL = import.meta.env.DEV
      ? 'http://localhost:10000'
      : window.location.origin;

    const response = await fetch(`${baseURL}/api/v1/analytics/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

/**
 * Get live viewer count - silent
 */
export const getLiveViewerCount = async () => {
  try {
    const baseURL = import.meta.env.DEV
      ? 'http://localhost:10000'
      : window.location.origin;

    const response = await fetch(`${baseURL}/api/v1/analytics/live-viewers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.liveViewers || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Initialize visitor tracking
 */
export const initializeTracking = () => {
  // Get or create visitor ID
  getVisitorId();

  // Track page view on load
  trackPageView(document.title || 'home');

  // Update session timestamp periodically
  const interval = setInterval(() => {
    getVisitorId();
  }, 5 * 60 * 1000); // Every 5 minutes

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
  });

  return () => clearInterval(interval);
};
