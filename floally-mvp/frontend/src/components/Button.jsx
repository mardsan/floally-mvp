import React from 'react';

/**
 * Reusable Button component with Hey Aimi brand styling
 * Inspired by Prompt template patterns, customized for Hey Aimi design system
 * 
 * @param {string} variant - Button style: 'primary', 'secondary', 'outline', 'ghost', 'danger'
 * @param {string} size - Size preset: 'sm', 'md', 'lg'
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state (shows spinner)
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional custom classes
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props 
}) => {
  // Base styles that apply to all buttons
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Color/style variants using Hey Aimi design system
  const variantStyles = {
    primary: 'bg-aimi-gradient text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 focus:ring-primary',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-aimi-lumo-green-50 focus:ring-primary',
    outline: 'bg-transparent text-gray-700 border-2 border-gray-300 hover:border-primary hover:text-primary hover:bg-aimi-lumo-green-50 focus:ring-primary',
    ghost: 'bg-transparent text-gray-700 hover:bg-aimi-lumo-green-50 hover:text-primary focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500'
  };
  
  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`;
  
  return (
    <button
      className={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
