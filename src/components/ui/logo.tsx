import React from 'react';

export const LeaoLiveLogo = ({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl md:text-3xl",
    large: "text-4xl md:text-5xl"
  };

  return (
    <div className={`font-bold text-red-600 ${sizeClasses[size]} ${className}`}>
      <span className="tracking-tight">LEÃO</span>
      <span className="font-light tracking-wider">LIVE</span>
    </div>
  );
};