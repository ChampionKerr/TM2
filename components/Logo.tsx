import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  width = 40, 
  height = 40, 
  color = '#1976d2' // MUI primary color
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle representing time/clock */}
      <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" />
      
      {/* Hour and minute hands forming a checkmark */}
      <path
        d="M12 20L18 26L28 16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Three dots representing people */}
      <circle cx="20" cy="10" r="2" fill={color} />
      <circle cx="14" cy="10" r="2" fill={color} />
      <circle cx="26" cy="10" r="2" fill={color} />
    </svg>
  );
};

export default Logo;
