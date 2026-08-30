import React from 'react';

const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const containerClasses = fullPage 
    ? 'min-h-[60vh] flex items-center justify-center bg-background'
    : 'flex justify-center items-center py-8';

  return (
    <div className={containerClasses}>
      <div className={`animate-spin rounded-full border-t-white border-r-transparent border-b-transparent border-l-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
