import React, { useEffect, useState } from 'react'
import WhatsAppButton from '../components/WhatsAppButton'

function getWhatsAppHref(number) {
  if (!number) return 'https://wa.me/923125066195';
  // strip non-digit characters and ensure leading country code
  const cleaned = String(number).replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) return `https://wa.me/${cleaned.replace('+','')}`;
  if (cleaned.startsWith('00')) return `https://wa.me/${cleaned.replace(/^00/,'')}`;
  return `https://wa.me/${cleaned}`;
}

export default function FloatingButtonsPage() {
  const [whHref, setWhHref] = useState('https://wa.me/923125066195');

  useEffect(() => {
    // Prefer a global value that some pages or backend may set
    if (typeof window !== 'undefined' && window.__WH_NUMBER) {
      setWhHref(getWhatsAppHref(window.__WH_NUMBER));
      return;
    }

    // Try fetching config from /api/v1/config if available (no error if missing)
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin}/api/v1/config`);
        if (!res.ok) return;
        const j = await res.json();
        if (j && j.whatsapp) setWhHref(getWhatsAppHref(j.whatsapp));
      } catch (e) {
        // ignore network errors — fallback will remain
      }
    })();
  }, []);

  return (
    <div aria-hidden="false">
      <div style={{ position: 'fixed', right: 18, bottom: 40, zIndex: 9999 }}>
        <WhatsAppButton href={whHref} ariaLabel="Chat on WhatsApp" />
      </div>
    </div>
  );
}
// (duplicate export removed)
