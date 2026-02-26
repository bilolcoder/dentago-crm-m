import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({ 
  fullscreen = false,
  text = 'DentaGo',
  className = ''
}) => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = `
    flex flex-col items-center justify-center
    ${fullscreen ? 'min-h-screen bg-white' : ''}
    ${className}
  `;

  const dots = '.'.repeat(dotCount).padEnd(3, ' ');

  return (
    <div className={containerClasses}>
      <div className="text-center">
     
        <div className="flex justify-center space-x-1 mt-70">
          <div className="w-2 h-2 bg-[#00BCE4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#00BCE4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#00BCE4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;