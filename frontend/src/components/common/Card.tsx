import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  gradient?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  rounded = 'xl',
  shadow = 'md',
  border = true,
  gradient = false,
  glass = false,
  onClick,
}) => {
  const baseClasses = 'transition-all duration-300';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  const borderClasses = border ? 'border border-gray-100' : '';
  const backgroundClasses = glass 
    ? 'bg-white/80 backdrop-blur-lg border-white/20' 
    : gradient 
    ? 'bg-gradient-to-br from-white to-gray-50' 
    : 'bg-white';
  
  const combinedClasses = [
    baseClasses,
    backgroundClasses,
    paddingClasses[padding],
    roundedClasses[rounded],
    shadowClasses[shadow],
    hoverClasses,
    borderClasses,
    onClick ? 'cursor-pointer' : '',
    className,
  ].join(' ');

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
