import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => {
  return <label className={`block text-sm font-medium text-text-secondary mb-2 ${className}`} {...props} />;
};