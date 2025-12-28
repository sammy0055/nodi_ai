import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiCheck, FiX, FiPlus, FiMinus, FiSave } from 'react-icons/fi';
import { createPortal } from 'react-dom';

interface ReviewDatePickerProps {
  value: number | null; // Value in minutes
  onChange: (minutes: number | null) => void;
  submit: (time: number) => void;
  label?: string;
  placeholder?: string;
  minMinutes?: number;
  maxMinutes?: number;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: string;
  showHours?: boolean;
  showMinutes?: boolean;
}

const ReviewDatePicker: React.FC<ReviewDatePickerProps> = ({
  value,
  onChange,
  submit,
  label = 'Review Time',
  placeholder = 'Set review time',
  maxMinutes = 1440, // 24 hours
  disabled = false,
  className = '',
  required = false,
  error,
  showHours = true,
  showMinutes = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [quickTimes, setQuickTimes] = useState<number[]>([15, 30, 45, 60, 90, 120, 180, 240]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Common time presets in minutes
  const timePresets = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
    { label: '6 hours', value: 360 },
    { label: '8 hours', value: 480 },
    { label: '12 hours', value: 720 },
    { label: '24 hours', value: 1440 },
  ];

  // Initialize from prop value
  useEffect(() => {
    if (value !== null && value !== undefined) {
      const h = Math.floor(value / 60);
      const m = value % 60;
      setHours(h);
      setMinutes(m);
    } else {
      setHours(0);
      setMinutes(0);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Format minutes to readable string
  const formatTime = (totalMinutes: number | null): string => {
    if (totalMinutes === null || totalMinutes === undefined) return '';

    if (totalMinutes < 60) {
      return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
    }

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (m === 0) {
      return `${h} hour${h !== 1 ? 's' : ''}`;
    }

    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

  // Handle hour change
  const handleHourChange = (newHours: number) => {
    if (newHours < 0) return;
    if (newHours > 23) return;
    setHours(newHours);
  };

  // Handle minute change
  const handleMinuteChange = (newMinutes: number) => {
    if (newMinutes < 0) return;
    if (newMinutes > 59) return;
    setMinutes(newMinutes);
  };

  // Increment hour
  const incrementHour = () => {
    if (hours < 23) {
      setHours((prev) => prev + 1);
    }
  };

  // Decrement hour
  const decrementHour = () => {
    if (hours > 0) {
      setHours((prev) => prev - 1);
    }
  };

  // Increment minute (by 5 for better UX)
  const incrementMinute = () => {
    if (minutes < 55) {
      setMinutes((prev) => prev + 5);
    } else {
      setMinutes(0);
      if (hours < 23) {
        setHours((prev) => prev + 1);
      }
    }
  };

  // Decrement minute
  const decrementMinute = () => {
    if (minutes >= 5) {
      setMinutes((prev) => prev - 5);
    } else {
      setMinutes(55);
      if (hours > 0) {
        setHours((prev) => prev - 1);
      }
    }
  };

  // Handle preset time selection
  const handlePresetSelect = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    setHours(h);
    setMinutes(m);
  };

  // Handle save
  const handleSave = () => {
    const totalMinutes = hours * 60 + minutes;
    submit(totalMinutes)
    onChange(totalMinutes);
    setIsOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    onChange(null);
    setHours(0);
    setMinutes(0);
    setIsOpen(false);
  };

  // Add custom quick time
  const addQuickTime = () => {
    const newTime = prompt('Enter time in minutes:');
    if (newTime) {
      const minutes = parseInt(newTime);
      if (!isNaN(minutes) && minutes > 0 && minutes <= maxMinutes) {
        setQuickTimes((prev) => {
          const newTimes = [...prev, minutes].sort((a, b) => a - b);
          return Array.from(new Set(newTimes)); // Remove duplicates
        });
      }
    }
  };

  // Open modal
  const openModal = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className={`${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <button
          type="button"
          onClick={openModal}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-left transition-all ${
            disabled
              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              : error
              ? 'bg-white border-red-300 text-gray-900 hover:border-red-400'
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          <div className="flex items-center">
            <FiClock className={`mr-2 ${error ? 'text-red-500' : 'text-gray-400'}`} size={16} />
            {value !== null && value !== undefined ? (
              <span className="font-medium">{formatTime(value)}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          {value !== null && value !== undefined && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <FiX size={14} />
            </button>
          )}
        </button>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Modal Portal */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                  <p className="text-sm text-gray-600 mt-1">Set the review time duration</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <FiX size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Time Display */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex justify-center items-center space-x-6">
                    {showHours && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">{hours.toString().padStart(2, '0')}</div>
                        <div className="text-sm text-gray-600">Hours</div>
                        <div className="flex justify-center space-x-2 mt-3">
                          <button
                            onClick={decrementHour}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <FiMinus size={16} />
                          </button>
                          <button
                            onClick={incrementHour}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {showHours && showMinutes && <div className="text-4xl font-bold text-gray-900">:</div>}

                    {showMinutes && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {minutes.toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-gray-600">Minutes</div>
                        <div className="flex justify-center space-x-2 mt-3">
                          <button
                            onClick={decrementMinute}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <FiMinus size={16} />
                          </button>
                          <button
                            onClick={incrementMinute}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Input */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {showHours && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={hours}
                          onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    {showMinutes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={minutes}
                          onChange={(e) => handleMinuteChange(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Quick Select</h4>
                    <button
                      onClick={addQuickTime}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FiPlus className="mr-1" size={14} />
                      Add Custom
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handlePresetSelect(preset.value)}
                        className={`px-3 py-2 text-sm rounded-lg border transition ${
                          hours * 60 + minutes === preset.value
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Quick Times */}
                  {quickTimes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Your Quick Times</h5>
                      <div className="flex flex-wrap gap-2">
                        {quickTimes.map((minutes) => (
                          <button
                            key={minutes}
                            onClick={() => handlePresetSelect(minutes)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                              hours * 60 + minutes === minutes
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {formatTime(minutes)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <FiClock className="text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Selected Time</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 mt-2">{formatTime(hours * 60 + minutes)}</p>
                  <p className="text-sm text-blue-700 mt-1">Total: {hours * 60 + minutes} minutes</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between space-x-3">
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 text-gray-700 hover:text-gray-900 transition flex items-center"
                  >
                    <FiX className="mr-2" />
                    Clear
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                    >
                      <FiSave className="mr-2" />
                      Set Time
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// Simple inline version for quick edits
export const InlineTimePicker: React.FC<{
  value: number | null;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMinutes, setTempMinutes] = useState<string>('');

  const formatDisplay = (minutes: number | null) => {
    if (minutes === null) return 'Not set';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const handleSave = () => {
    const minutes = parseInt(tempMinutes);
    if (!isNaN(minutes) && minutes >= 0) {
      onChange(minutes);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="number"
            value={tempMinutes}
            onChange={(e) => setTempMinutes(e.target.value)}
            autoFocus
            className="px-2 py-1 pr-8 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-24"
            placeholder="Minutes"
            min="0"
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">min</span>
        </div>
        <button
          onClick={handleSave}
          className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
        >
          <FiCheck size={14} />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
        >
          <FiX size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center group">
      <span className="text-sm text-gray-700">{formatDisplay(value)}</span>
      {!disabled && (
        <button
          onClick={() => {
            setTempMinutes(value?.toString() || '');
            setIsEditing(true);
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800"
        >
          <FiClock size={12} />
        </button>
      )}
    </div>
  );
};

export default ReviewDatePicker;
