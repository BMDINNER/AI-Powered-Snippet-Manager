import React from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: IconDefinition;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${icon ? 'pl-10' : ''}
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
            rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            min-h-[100px] resize-y
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';