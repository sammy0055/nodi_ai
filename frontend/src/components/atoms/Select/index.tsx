import { useState, useRef, useEffect } from 'react';

interface OptionType {
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionType[];
  label?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.label === value);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}
      <div className="relative">
        {/* Select trigger button */}
        <button
          type="button"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-left focus:ring-2 focus:ring-primary-500 focus:border-transparent flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>
            {selectedOption ? (
              <>
                {selectedOption.label}
                {selectedOption.description && (
                  <span className="text-xs text-neutral-500 ml-2">
                    {selectedOption.description}
                  </span>
                )}
              </>
            ) : (
              'Select an option'
            )}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((opt) => (
              <li
                key={opt.label}
                className={`px-3 py-2 cursor-pointer hover:bg-neutral-100 ${
                  opt.label === value ? 'bg-primary-50' : ''
                }`}
                onClick={() => {
                  onChange(opt.label);
                  setIsOpen(false);
                }}
              >
                <div className="font-medium">{opt.label}</div>
                {opt.description && (
                  <div className="text-xs text-neutral-500">{opt.description}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};