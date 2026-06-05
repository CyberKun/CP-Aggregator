import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, onCheckedChange, checked, onChange, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (onCheckedChange) onCheckedChange(e.target.checked);
    };

    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div className={cn(
            "w-5 h-5 rounded border border-white/10 bg-white/5",
            "peer-focus:ring-2 peer-focus:ring-cyan-500/50",
            "transition-colors duration-200",
            "peer-checked:bg-cyan-500 peer-checked:border-cyan-500",
            className
          )}>
          </div>
          <Check 
            className={cn(
              "absolute w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-200",
              checked && "opacity-100"
            )} 
          />
        </div>
        {label && (
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
