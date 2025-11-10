import React from 'react';

/**
 * Reusable Card component with OkAimy brand styling
 * Standardizes card patterns across the application
 * 
 * @param {string} variant - Card style: 'default', 'gradient', 'bordered', 'elevated'
 * @param {boolean} hover - Whether to show hover effects
 * @param {string} padding - Padding size: 'sm', 'md', 'lg', 'none'
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional custom classes
 */
const Card = ({ 
  variant = 'default',
  hover = false,
  padding = 'md',
  children,
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = 'rounded-xl transition-all duration-200';
  
  // Padding variants
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  // Variant styles using OkAimy design system
  const variantStyles = {
    default: 'bg-white border border-gray-200 shadow-sm',
    gradient: 'bg-gradient-to-br from-okaimy-mint-50 to-okaimy-emerald-50 border-2 border-okaimy-mint-200',
    bordered: 'bg-white border-2 border-okaimy-mint-200',
    elevated: 'bg-white shadow-lg border border-okaimy-mint-100'
  };
  
  // Hover effects
  const hoverStyles = hover 
    ? 'hover:shadow-xl hover:-translate-y-1 hover:border-okaimy-mint-300 cursor-pointer' 
    : '';
  
  // Combine all styles
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`;
  
  return (
    <div className={combinedStyles} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header component
 */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

/**
 * Card Title component
 */
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-gray-900 ${className}`}>
    {children}
  </h3>
);

/**
 * Card Body component
 */
export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

/**
 * Card Footer component
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export default Card;
