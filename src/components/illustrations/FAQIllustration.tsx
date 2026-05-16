import React from 'react';

export function FAQIllustration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1920 400" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      {/* Background Buildings */}
      <g fill="#F8FAFC">
        <rect x="900" y="100" width="100" height="300" />
        <rect x="1050" y="150" width="80" height="250" />
        <path d="M 1180 300 Q 1200 50 1280 150 Q 1300 200 1350 300 Z" />
        <rect x="1400" y="80" width="120" height="320" />
        <rect x="1550" y="180" width="100" height="220" />
        <rect x="1700" y="120" width="180" height="280" />
      </g>
      
      {/* Foreground Buildings */}
      <g fill="#F1F5F9">
        <rect x="1000" y="200" width="120" height="200" />
        <path d="M 1000 200 L 1060 150 L 1120 200 Z" />
        
        <rect x="1250" y="220" width="80" height="180" />
        <rect x="1450" y="160" width="100" height="240" />
        
        <rect x="1620" y="240" width="150" height="160" />
      </g>
      
      {/* Windows Details */}
      <g fill="#E2E8F0">
        <rect x="1470" y="180" width="15" height="15" /><rect x="1510" y="180" width="15" height="15" />
        <rect x="1470" y="220" width="15" height="15" /><rect x="1510" y="220" width="15" height="15" />
        <rect x="1470" y="260" width="15" height="15" /><rect x="1510" y="260" width="15" height="15" />
        <rect x="1470" y="300" width="15" height="15" /><rect x="1510" y="300" width="15" height="15" />
      </g>
      
      {/* Trees */}
      <g fill="#F1F8F1">
        <circle cx="950" cy="300" r="40" />
        <circle cx="1180" cy="320" r="30" />
        <circle cx="1400" cy="280" r="50" />
        <circle cx="1580" cy="310" r="35" />
      </g>
      <g fill="#CBD5E1">
        <rect x="945" y="330" width="10" height="70" />
        <rect x="1175" y="340" width="8" height="60" />
        <rect x="1395" y="320" width="12" height="80" />
        <rect x="1575" y="330" width="8" height="70" />
      </g>

      {/* Charging Station & Details */}
      <g transform="translate(1300, 230)">
        {/* EV Charger */}
        <rect x="-30" y="50" width="20" height="120" fill="#475569" rx="4" />
        <rect x="-25" y="60" width="10" height="20" fill="#FFF" />
        <path d="M -22 65 L -25 72 L -20 72 L -20 77 L -18 70 L -22 70 Z" fill="#1E293B" />
        
        {/* Person walking */}
        <circle cx="-70" cy="110" r="8" fill="#94A3B8" />
        <rect x="-75" y="125" width="12" height="30" fill="#818CF8" />
        <path d="M -70 155 L -75 170 M -65 155 L -60 170" stroke="#475569" strokeWidth="4" />
        
        {/* Ev Car (Yellow) */}
        <path d="M 450 110 L 470 90 L 520 90 L 540 110 L 540 130 L 450 130 Z" fill="#FBBF24" />
        <circle cx="470" cy="130" r="10" fill="#1E293B" />
        <circle cx="520" cy="130" r="10" fill="#1E293B" />
        <path d="M 475 95 L 495 95 L 495 110 L 460 110 Z" fill="#F1F5F9" />
        <path d="M 500 95 L 515 95 L 530 110 L 500 110 Z" fill="#F1F5F9" />
        
        {/* Person near car */}
        <circle cx="430" cy="100" r="8" fill="#94A3B8" />
        <rect x="425" y="115" width="10" height="25" fill="#34D399" />
        <path d="M 430 140 L 425 170 M 435 140 L 435 170" stroke="#475569" strokeWidth="4" />
      </g>

      {/* Ground border */}
      <rect x="0" y="395" width="1920" height="5" fill="#E2E8F0" />
    </svg>
  );
}
