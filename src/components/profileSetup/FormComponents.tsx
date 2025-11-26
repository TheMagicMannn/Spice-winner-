// src/components/profileSetup/FormComponents.tsx
import React from 'react';
import { Label } from '../Label';

// Reusable form components

export const CheckboxGrid = ({ 
  title, 
  options, 
  selected, 
  onToggle, 
  max, 
  error,
  columns = 3
}: { 
  title: string; 
  options: string[]; 
  selected: string[]; 
  onToggle: (option: string) => void; 
  max?: number;
  error?: string;
  columns?: number;
}) => (
  <div className="space-y-2">
    <Label>{title} {max && `(Max ${max})`}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-2`}>
      {options.map((option) => (
        <button 
          key={option} 
          type="button" 
          onClick={() => onToggle(option)} 
          disabled={Boolean(max && !selected.includes(option) && selected.length >= max)}
          className={`py-2 px-3 text-sm rounded-lg text-left transition-all ${
            selected.includes(option) 
              ? 'bg-brand-primary text-white font-semibold' 
              : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
          } ${max && !selected.includes(option) && selected.length >= max ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export const RadioGrid = ({
  title,
  options,
  selected,
  onSelect,
  error
}: {
  title: string;
  options: Array<{ value: string; label: string }> | string[];
  selected: string;
  onSelect: (value: string) => void;
  error?: string;
}) => (
  <div className="space-y-2">
    <Label>{title}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="grid grid-cols-1 gap-2">
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`py-3 px-4 text-sm rounded-lg text-left transition-all ${
              selected === value
                ? 'bg-brand-primary text-white font-semibold'
                : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  required, 
  name,
  error 
}: { 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
  options: Array<{ value: string; label: string }> | string[];
  placeholder?: string;
  required?: boolean;
  name?: string;
  error?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <select 
      value={value} 
      onChange={onChange} 
      name={name} 
      required={required} 
      className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
  </div>
);

export const TagMultiSelect = ({ 
  title, 
  options, 
  selected, 
  onToggle, 
  error 
}: { 
  title: string; 
  options: string[]; 
  selected: string[]; 
  onToggle: (option: string) => void; 
  error?: string;
}) => (
  <div className="space-y-2">
    <Label>{title}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button 
          key={option} 
          type="button" 
          onClick={() => onToggle(option)} 
          className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
            selected.includes(option) 
              ? 'bg-brand-primary text-white' 
              : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export const InfoBox = ({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) => {
  const colors = {
    info: 'bg-blue-500/10 border-blue-500 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
    success: 'bg-green-500/10 border-green-500 text-green-400'
  };
  
  return (
    <div className={`p-4 rounded-lg border ${colors[type]}`}>
      {children}
    </div>
  );
};

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    {subtitle && <p className="text-text-secondary">{subtitle}</p>}
  </div>
);

export const SubsectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-xl font-semibold text-brand-secondary mb-4 mt-6">{title}</h3>
);
