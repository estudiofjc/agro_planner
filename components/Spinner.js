import React from 'react';

const Spinner = () => {
  return (
    React.createElement('div', { className: "flex flex-col items-center justify-center space-y-4" },
      React.createElement('div', { className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-400" }),
      React.createElement('p', { className: "text-emerald-200 text-lg" }, "Analizando cosmos y tierra...")
    )
  );
};

export default Spinner;
