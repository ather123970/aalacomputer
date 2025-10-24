import React from 'react';

// Inline WhatsApp SVG to avoid missing asset issues.
export default function WhatsAppButton({ href = 'https://wa.me/923125066195', ariaLabel = 'WhatsApp' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      style={{
        width: 52,
        height: 52,
        borderRadius: 9999,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        textDecoration: 'none',
        color: '#fff'
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="24" height="24" rx="12" fill="#25D366" />
        <path d="M17.472 14.382c-.297-.148-1.758-.867-2.03-.967-.273-.099-.472-.148-.672.149-.198.297-.768.966-.942 1.165-.173.198-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.298.297-.497.099-.198.05-.372-.025-.52-.074-.148-.672-1.611-.921-2.206-.243-.579-.49-.5-.672-.51l-.573-.01c-.198 0-.52.074-.79.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.148.198 2.095 3.2 5.076 4.487 2.98 1.288 3.487 1.03 4.116.965.198-.031.608-.198.695-.389.088-.198.088-.366.062-.389-.025-.024-.297-.099-.695-.248z" fill="#fff"/>
      </svg>
    </a>
  );
}
