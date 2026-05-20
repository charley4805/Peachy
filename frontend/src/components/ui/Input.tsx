import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-obsidian mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-silver-medium">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full py-2.5 rounded-lg border text-sm transition-colors outline-none
              ${icon ? 'pl-10 pr-3' : 'px-3'}
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                : 'border-silver-soft focus:border-brand-purple focus:ring-1 focus:ring-brand-purple'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
