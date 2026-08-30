import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, retryFn }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">Something went wrong</h3>
      <p className="text-sm text-secondary max-w-md mb-6">{message || 'An unexpected error occurred. Please try again.'}</p>
      {retryFn && (
        <button
          onClick={retryFn}
          className="border border-white text-white bg-transparent hover:bg-white hover:text-black py-2 px-6 rounded text-sm font-semibold uppercase tracking-wider transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
