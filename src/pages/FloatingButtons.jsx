import React, { useEffect, useState } from 'react'
import WhatsAppButton from '../components/WhatsAppButton'

const DEFAULT_MESSAGE = 
  "Assalamualaikum! 👋 I'm interested in your products and need some quick assistance. Could you please guide me? Thank you!";

function getWhatsAppHref(number) {
  const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);

  if (!number)
    return `https://wa.me/923125066195?text=${encodedMessage}`;

  // Clean non-digit characters
  const cleaned = String(number).replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+'))
    return `https://wa.me/${cleaned.replace('+', '')}?text=${encodedMessage}`;

  if (cleaned.startsWith('00'))
    return `https://wa.me/${cleaned.replace(/^00/, '')}?text=${encodedMessage}`;

  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
}

export default function FloatingButtonsPage() {
  const [whHref, setWhHref] = useState(
    `https://wa.me/923125066195?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
  );

  useEffect(() => {
    // Global injected number (if exists)
    if (typeof window !== 'undefined' && window.__WH_NUMBER) {
      setWhHref(getWhatsAppHref(window.__WH_NUMBER));
      return;
    }

    // Try fetching /api/v1/config
    (async () => {
      try {
        const baseURL = import.meta.env.DEV
          ? "http://localhost:10000"
          : window.location.origin;

        const res = await fetch(`${baseURL}/api/v1/config`);
        if (!res.ok) return;

        const j = await res.json();
        if (j && j.whatsapp) {
          setWhHref(getWhatsAppHref(j.whatsapp));
        }
      } catch (err) {
        // ignore and use fallback
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
