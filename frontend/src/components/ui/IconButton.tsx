import React from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
  variant?: 'default' | 'primary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  label,
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    primary: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  };
  
  const sizeClasses = {
    xs: 'p-1 text-xs',
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-2.5 text-lg'
  };
  
  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={label}
      title={label}
      {...props}
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4" />
    </button>
  );
};