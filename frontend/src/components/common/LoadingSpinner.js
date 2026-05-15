import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div
      className={`
        animate-spin rounded-full border-transparent border-t-primary-500
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
      style={{ borderStyle: 'solid' }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-bg bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
