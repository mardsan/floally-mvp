import React from 'react';

/**
 * Reusable Icon component for displaying SVG icons from the Prompt template
 * 
 * @param {string} name - Icon filename without .svg extension (e.g., 'target', 'chat', 'mail')
 * @param {string} size - Size preset: 'sm' (16px), 'md' (24px), 'lg' (32px), 'xl' (48px), '2xl' (64px), or custom class
 * @param {string} className - Additional Tailwind classes for styling (colors, transforms, etc.)
 */
const Icon = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    'sm': 'w-4 h-4',
    'md': 'w-6 h-6',
    'lg': 'w-8 h-8',
    'xl': 'w-12 h-12',
    '2xl': 'w-16 h-16',
    '3xl': 'w-24 h-24'
  };

  const sizeClass = sizeClasses[size] || size;

  return (
    <img
      src={`/icons/${name}.svg`}
      alt=""
      className={`inline-block ${sizeClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export default Icon;
