import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ className = '', noPadding = false, children, ...props }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-silver-soft overflow-hidden ${className}`} 
      {...props}
    >
      {!noPadding ? (
        <div className="p-6">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b border-silver-soft bg-gray-50/50 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-bold text-obsidian ${className}`} {...props}>
      {children}
    </h3>
  );
}
