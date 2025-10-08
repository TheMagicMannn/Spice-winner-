import React, { createContext, useContext } from 'react';

interface RadioGroupContextType {
  name: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: any) => void;
  name?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ children, value, onValueChange, name = 'radiogroup' }) => {
  const contextValue = {
    name,
    selectedValue: value,
    onChange: onValueChange,
  };
  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div role="radiogroup" className="space-y-2">{children}</div>
    </RadioGroupContext.Provider>
  );
};

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, ...props }) => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  return (
    <input
      type="radio"
      name={context.name}
      value={value}
      checked={context.selectedValue === value}
      onChange={() => context.onChange(value)}
      className="h-4 w-4 text-brand-primary bg-base-300 border-base-300 focus:ring-brand-primary"
      {...props}
    />
  );
};