import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function ArrowRightIcon({ className = "", size = 16 }: IconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
    >
      <g clipPath="url(#arrow-right_a)">
        <path 
          fill="currentColor"
          d="M8.757 13.6565L14.414 7.99951L8.757 2.34351L7.343 3.75751L10.586 6.99951H2V8.99951H10.586L7.343 12.2425L8.757 13.6565Z"
        />
      </g>
      <defs>
        <clipPath id="arrow-right_a">
          <path d="M0 0h16v16H0z"/>
        </clipPath>
      </defs>
    </svg>
  );
} 