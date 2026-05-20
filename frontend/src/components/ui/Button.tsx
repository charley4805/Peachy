import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-gradient-to-r from-brand-coral to-brand-purple text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-brand-purple',
      secondary: 'bg-white text-obsidian border border-silver-soft shadow-sm hover:bg-gray-50 focus:ring-silver-medium',
      outline: 'bg-transparent text-brand-purple border-2 border-brand-purple hover:bg-brand-purple/5 focus:ring-brand-purple',
      ghost: 'bg-transparent text-silver-dark hover:text-obsidian hover:bg-gray-100 focus:ring-silver-medium',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const classes = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ');

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
