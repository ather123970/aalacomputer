import React from 'react';

export default function CustomCartIcon({ count = 0, size = 24 }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* White background rounded square - solid white */}
      <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
        {/* Blue shopping cart icon - custom SVG with solid blue */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Cart basket */}
          <circle cx="9" cy="21" r="1" fill="#1E40AF" />
          <circle cx="20" cy="21" r="1" fill="#1E40AF" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>

      {/* Red badge with count - prominent and animated */}
      {count > 0 && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white animate-bounce">
          <span className="text-[11px] font-extrabold leading-none">
            {count > 99 ? '99+' : count}
          </span>
        </div>
      )}
    </div>
  );
}
