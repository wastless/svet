import React from "react";

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return (
    <div className={`c-spinner ${className || ""}`}></div>
  );
};

export const FullScreenLoader: React.FC = () => {
  return (
    <div className="c-loader">
      <div className="c-loader_spinner c-spinner"></div>
    </div>
  );
}; 