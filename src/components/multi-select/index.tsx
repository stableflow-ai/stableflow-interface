import { useState, useRef, useEffect } from 'react';

interface Option {
  key: string;
  name: string;
  color?: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  minSelections?: number;
}

export default function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  label,
  className = "",
  minSelections = 0
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionKey: string) => {
    const isSelected = selectedValues.includes(optionKey);
    if (isSelected) {
      // Check if removing would go below minimum selections
      if (selectedValues.length > minSelections) {
        // Remove from selection
        onChange(selectedValues.filter(value => value !== optionKey));
      }
    } else {
      // Add to selection
      onChange([...selectedValues, optionKey]);
    }
  };

  const getSelectedNames = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.key === selectedValues[0]);
      return option?.name || placeholder;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[12px] text-[#9FA7BA] mb-[4px]">
          {label}
        </label>
      )}
      
      <div
        onClick={handleToggle}
        className={`
          px-[12px] py-[8px] text-[12px] border border-[#F2F2F2] rounded-[6px] 
          bg-white cursor-pointer transition-all duration-200
          hover:border-[#6284F5] focus:outline-none focus:ring-2 focus:ring-[#6284F5] focus:border-transparent
          ${isOpen ? 'border-[#6284F5] ring-2 ring-[#6284F5]' : ''}
          min-w-[140px] flex items-center justify-between
        `}
      >
        <span className={`${selectedValues.length === 0 ? 'text-[#9FA7BA]' : 'text-[#2B3337]'}`}>
          {getSelectedNames()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#F2F2F2] rounded-[6px] shadow-lg z-50 max-h-[200px] overflow-y-auto">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.key);
            return (
              <div
                key={option.key}
                onClick={() => handleOptionClick(option.key)}
                className={`
                  px-[12px] py-[8px] text-[12px] cursor-pointer transition-colors duration-150
                  flex items-center gap-[8px]
                  ${isSelected 
                    ? 'bg-[#6284F5] text-white' 
                    : 'hover:bg-[#F8F9FA] text-[#2B3337]'
                  }
                `}
              >
                {/* Color indicator */}
                {option.color && (
                  <div
                    className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                
                {/* Checkbox indicator */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded-sm" />
                  )}
                </div>
                
                {/* Option name */}
                <span className="flex-1">{option.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
