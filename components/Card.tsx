
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`glass rounded-3xl p-6 overflow-hidden relative ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 font-heading">{title}</h3>}
      {children}
    </div>
  );
};
