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
      <path
        d="M11 5.5H7v13h4zm6 0h-4v13h4z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
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

export function EmptyBlocksIcon({ className = "", size = 48 }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

export function BlockIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

export function RemoveBlockIcon({ className = "", size = 20 }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function TargetDayIcon({ className = "" }: IconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="72" 
      height="34" 
      fill="none" 
      viewBox="0 0 64 30" 
      className={className}
    >
      <g clipPath="url(#a)">
        <path fill="#F90000" d="M60.8 8.66c.455.455.82.82 1.184 1.229 2.368 2.594 2.641 5.87.865 8.874-.865 1.456-2.05 2.593-3.37 3.594-3.052 2.276-6.468 3.777-10.111 4.733-11.568 3.049-23.228 3.185-34.933.865-3.097-.592-6.103-1.548-8.927-3.095-1.548-.864-2.96-1.866-4.007-3.322C-.276 19.172-.458 16.67.863 14.03c.865-1.775 2.232-3.14 3.78-4.369 2.733-2.184 5.739-3.822 8.972-5.096C25.32-.213 37.39-1.124 49.732 1.288c3.37.637 6.559 1.775 9.474 3.686.592.41 1.184.82 1.73 1.32 1.093.956 1.048 1.274-.136 2.366M49.823 3.7v-.182c-.728-.136-1.412-.318-2.14-.455-9.701-1.638-19.266-1.138-28.693 1.73-4.1 1.228-8.062 2.912-11.569 5.414-1.32.956-2.641 2.003-3.689 3.231-2.414 2.867-2.14 5.78.82 8.1 1.275 1.002 2.778 1.775 4.281 2.458 3.234 1.41 6.65 2.093 10.111 2.594 8.29 1.137 16.578 1.046 24.822-.365 4.418-.773 8.699-2.047 12.616-4.368 1.594-.956 3.097-2.048 4.19-3.55 1.867-2.502 1.685-5.142-.547-7.326-.683-.683-1.457-1.274-2.277-1.82-3.826-2.503-8.061-3.55-12.57-3.459-.957 0-1.959.091-2.915.137-.592 0-1.093-.228-1.139-.865-.045-.546.365-.91.911-.955.957-.137 1.913-.364 2.87-.41 1.64-.045 3.279.046 4.918.091"/>
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h64v29.553H0z"/>
        </clipPath>
      </defs>
    </svg>
  );
}
