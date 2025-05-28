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
          <path d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function PlayIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path
        d="M8 5.5V12h11v-.75C14 9.5 9.5 5.5 9.5 5.5zm0 13V12h11v.75c-5 1.75-9.5 5.75-9.5 5.75z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function PauseIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M11 5.5H7v13h4zm6 0h-4v13h4z" clipRule="evenodd" fillRule="evenodd" />
    </svg>
  );
}

export function ErrorIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

export function LoadingSpinner({ className = "", size = 20 }: IconProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`border-current animate-spin rounded-full border-b-2 ${className}`}
    />
  );
}

export function VolumeOnIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path
        d="M12.5 3H12l-.299.398V3.4l-.003.003-.018.024-.088.108a10 10 0 0 1-.375.422c-.339.36-.848.855-1.52 1.381C8.348 6.392 6.37 7.553 3.82 8.017L3 8.164v7.67l.821.149c2.55.463 4.528 1.624 5.875 2.679q.812.633 1.52 1.381.241.257.464.53l.018.024.002.002.001.001.299.4h4.5V3zm.174 2.326A13 13 0 0 0 12.97 5h1.53v14h-1.53q-.145-.166-.296-.326a16 16 0 0 0-1.745-1.587C9.546 16.006 7.554 14.805 5 14.19V9.81c2.554-.615 4.546-1.815 5.929-2.898a15.6 15.6 0 0 0 1.745-1.586M19.5 6v12h2V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function VolumeOffIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path
        d="m16.5 17.44 3.355 2.826 1.289-1.53-4.644-3.91v-.012l-2-1.674L2.145 2.736.856 4.266l4.133 3.48a12 12 0 0 1-1.168.27L3 8.166v7.669l.821.149c2.55.463 4.528 1.624 5.875 2.679q.812.633 1.52 1.381.241.257.464.53l.018.024.002.002.001.001L12 21h4.5zm-2-1.684V19h-1.53q-.145-.166-.296-.326a16 16 0 0 0-1.745-1.587C9.546 16.006 7.554 14.805 5 14.19V9.81c.63-.151 1.225-.339 1.785-.551zM16.5 4v6.902l-2-1.675V5h-1.53a14 14 0 0 1-.296.326c-.322.342-.768.78-1.335 1.255L9.777 5.273q.766-.607 1.44-1.317.24-.257.463-.53l.018-.024.002-.003h.001L12 3h4.5z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
      <defs>
        <clipPath>
          <path d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
