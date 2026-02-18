import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiSun,
  FiMoon,
  FiCalendar,
  FiChevronRight,
  FiChevronDown,
  FiAlertCircle,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi';
import Button from '../../atoms/Button/Button';

export interface ServiceSchedule {
  dayOfWeek: string;
  hours: { open: string; close: string }[];
}

interface ServiceScheduleFormProps {
  initialSchedule?: ServiceSchedule[];
  timeZone?: string; // current selected timezone (must not be empty)
  onScheduleChange?: (schedule: ServiceSchedule[], timeZone: string) => void;
  onTimezoneChange?: (timezone: string) => void; // callback when timezone changes
}

const ServiceScheduleForm: React.FC<ServiceScheduleFormProps> = ({
  initialSchedule = [],
  timeZone = 'UTC',
  onScheduleChange,
  onTimezoneChange,
}) => {
  // Days of week configuration with colors
  const daysOfWeek = [
    { id: 'monday', label: 'Monday', short: 'MON', color: 'bg-blue-100 text-blue-800' },
    { id: 'tuesday', label: 'Tuesday', short: 'TUE', color: 'bg-purple-100 text-purple-800' },
    { id: 'wednesday', label: 'Wednesday', short: 'WED', color: 'bg-pink-100 text-pink-800' },
    { id: 'thursday', label: 'Thursday', short: 'THU', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'friday', label: 'Friday', short: 'FRI', color: 'bg-orange-100 text-orange-800' },
    { id: 'saturday', label: 'Saturday', short: 'SAT', color: 'bg-teal-100 text-teal-800' },
    { id: 'sunday', label: 'Sunday', short: 'SUN', color: 'bg-red-100 text-red-800' },
  ];

  // Default schedule
  const defaultSchedule: ServiceSchedule[] = daysOfWeek.map((day) => ({
    dayOfWeek: day.id,
    hours: [],
  }));

  // State for schedule
  const [schedule, setSchedule] = useState<ServiceSchedule[]>(
    initialSchedule?.length > 0 ? initialSchedule : defaultSchedule
  );

  // State for editing
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempHours, setTempHours] = useState<{ open: string; close: string }[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>('monday');
  const [showAllDays, setShowAllDays] = useState(false);

  // State for timezone (sync with prop)
  const [selectedTimezone, setSelectedTimezone] = useState(timeZone || 'UTC');

  // Time options for dropdown
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    return { value: time24, label: time12 };
  });

  // Sync internal timezone state with prop
  useEffect(() => {
    const timeZones = getTimezoneOptions();
    setSelectedTimezone(timeZone || timeZones[0].label || 'UTC');
  }, [timeZone]);

  // Generate timezone options (using Intl if available, else fallback list)
  const getTimezoneOptions = (): { value: string; label: string }[] => {
    try {
      // Use Intl API if supported (modern browsers)
      if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
        const timezones = Intl.supportedValuesOf('timeZone');
        return timezones.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }));
      }
    } catch (e) {
      // fall through to fallback
    }
    // Fallback list of common timezones (non-empty)
    const fallbackTimezones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];
    return fallbackTimezones.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }));
  };

  const timezoneOptions = getTimezoneOptions();

  // Handle timezone change
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTz = e.target.value;
    setSelectedTimezone(newTz);
    onTimezoneChange?.(newTz);
  };

  // Toggle day expansion
  const toggleExpandDay = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  // Start editing a day's hours
  const startEditing = (dayId: string) => {
    const day = schedule.find((d) => d.dayOfWeek === dayId);
    setEditingDay(dayId);
    setTempHours(day?.hours.length ? [...day.hours] : []);
    setExpandedDay(dayId);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingDay(null);
    setTempHours([]);
  };

  // Save editing
  const saveEditing = () => {
    if (!editingDay) return;

    const updatedSchedule = schedule.map((day) =>
      day.dayOfWeek === editingDay ? { ...day, hours: tempHours.length > 0 ? tempHours : [] } : day
    );

    setSchedule(updatedSchedule);
    setEditingDay(null);
    setTempHours([]);
    onScheduleChange?.(updatedSchedule, selectedTimezone);
  };

  // Add time slot
  const addTimeSlot = () => {
    const lastClose = tempHours.length > 0 ? tempHours[tempHours.length - 1].close : '09:00';

    const [lastHour, lastMinute] = lastClose.split(':').map(Number);
    const nextTime = new Date(0, 0, 0, lastHour, lastMinute + 30);
    const nextOpen = `${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`;

    setTempHours([...tempHours, { open: nextOpen, close: '17:00' }]);
  };

  // Remove time slot
  const removeTimeSlot = (index: number) => {
    const updatedHours = tempHours.filter((_, i) => i !== index);
    setTempHours(updatedHours);
  };

  // Update time slot
  const updateTimeSlot = (index: number, field: 'open' | 'close', value: string) => {
    const updatedHours = [...tempHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setTempHours(updatedHours);
  };

  // Format time to 12h
  const formatTime = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Get day info
  const getDayInfo = (dayId: string) => {
    return daysOfWeek.find((d) => d.id === dayId) || daysOfWeek[0];
  };

  // Toggle day active status
  const toggleDayActive = (dayId: string) => {
    const updatedSchedule = schedule.map((day) =>
      day.dayOfWeek === dayId ? { ...day, hours: day.hours.length > 0 ? [] : [{ open: '09:00', close: '17:00' }] } : day
    );
    setSchedule(updatedSchedule);
    onScheduleChange?.(updatedSchedule, selectedTimezone);
  };

  // Set all days to default hours
  const setAllDays = () => {
    const updatedSchedule = schedule.map((day) => ({
      ...day,
      hours: [{ open: '09:00', close: '17:00' }],
    }));
    setSchedule(updatedSchedule);
    onScheduleChange?.(updatedSchedule, selectedTimezone);
  };

  // Clear all days
  const clearAllDays = () => {
    const updatedSchedule = schedule.map((day) => ({
      ...day,
      hours: [],
    }));
    setSchedule(updatedSchedule);
    onScheduleChange?.(updatedSchedule, selectedTimezone);
  };

  // Calculate statistics
  const totalOpenDays = schedule.filter((day) => day.hours.length > 0).length;
  const totalTimeSlots = schedule.reduce((acc, day) => acc + day.hours.length, 0);
  const isToday = (dayId: string) => {
    const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    return dayId === today;
  };

  // Display days based on showAllDays state
  const displayDays = showAllDays ? schedule : schedule.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4">
              <FiCalendar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Service Schedule</h2>
              <p className="text-gray-600">Manage your business operating hours</p>
            </div>
          </div>

          {/* Timezone Selector and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <FiClock className="text-gray-500" size={18} />
              <select
                value={selectedTimezone}
                onChange={handleTimezoneChange}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={clearAllDays} className="border-gray-300">
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={setAllDays}>
                Set Weekdays
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <FiClock className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-700">Open Days</p>
                <p className="text-2xl font-bold text-blue-900">{totalOpenDays}/7</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                <FiSun className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-green-700">Total Slots</p>
                <p className="text-2xl font-bold text-green-900">{totalTimeSlots}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                <FiAlertCircle className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-purple-700">Status</p>
                <p className="text-lg font-bold text-purple-900">{totalOpenDays > 0 ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="space-y-4">
          {displayDays.map((day) => {
            const dayInfo = getDayInfo(day.dayOfWeek);
            const isOpen = day.hours.length > 0;
            const isEditing = editingDay === day.dayOfWeek;
            const isExpanded = expandedDay === day.dayOfWeek;

            return (
              <div
                key={day.dayOfWeek}
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  isToday(day.dayOfWeek) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpandDay(day.dayOfWeek)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center mr-4 ${dayInfo.color}`}
                      >
                        <span className="text-sm font-bold">{dayInfo.short}</span>
                        <span className="text-xs mt-1">{isOpen ? 'OPEN' : 'CLOSED'}</span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">{dayInfo.label}</h3>
                          {isToday(day.dayOfWeek) && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {isOpen ? (
                            <div className="flex items-center text-green-600">
                              <FiSun size={14} className="mr-1" />
                              <span className="text-sm">
                                {day.hours.map((slot, idx) => (
                                  <span key={idx}>
                                    {formatTime(slot.open)} - {formatTime(slot.close)}
                                    {idx < day.hours.length - 1 && ', '}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <FiMoon size={14} className="mr-1" />
                              <span className="text-sm">Closed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDayActive(day.dayOfWeek);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isOpen
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isOpen ? 'Mark Closed' : 'Mark Open'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(day.dayOfWeek);
                        }}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        {isEditing ? (
                          <FiRefreshCw className="text-blue-600" size={18} />
                        ) : (
                          <FiEdit2 className="text-gray-600" size={18} />
                        )}
                      </button>

                      <button
                        onClick={() => toggleExpandDay(day.dayOfWeek)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        {isExpanded ? (
                          <FiChevronDown className="text-gray-500" size={20} />
                        ) : (
                          <FiChevronRight className="text-gray-500" size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {isEditing ? (
                      // Edit Mode
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">Edit {dayInfo.label} Hours</h4>
                          <button
                            onClick={addTimeSlot}
                            disabled={tempHours.length >= 4}
                            className="flex items-center text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiPlus className="mr-1" size={16} />
                            Add Time Slot
                          </button>
                        </div>

                        {tempHours.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                            <FiClock className="mx-auto mb-3 text-gray-400" size={32} />
                            <p className="text-gray-600 mb-2">No hours set for this day</p>
                            <p className="text-sm text-gray-500">Add time slots to make this day active</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tempHours.map((slot, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200"
                              >
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                                    <div className="relative">
                                      <select
                                        value={slot.open}
                                        onChange={(e) => updateTimeSlot(index, 'open', e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                      >
                                        {timeOptions.map((time) => (
                                          <option key={time.value} value={time.value}>
                                            {time.label}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <FiChevronDown />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                                    <div className="relative">
                                      <select
                                        value={slot.close}
                                        onChange={(e) => updateTimeSlot(index, 'close', e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                      >
                                        {timeOptions.map((time) => (
                                          <option key={time.value} value={time.value}>
                                            {time.label}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <FiChevronDown />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => removeTimeSlot(index)}
                                  disabled={tempHours.length <= 1}
                                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                          <Button
                            variant="outline"
                            onClick={cancelEditing}
                            className="border-gray-300 hover:border-gray-400"
                          >
                            <FiX className="mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={saveEditing}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          >
                            <FiSave className="mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="p-6">
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3">Current Schedule</h5>
                              {isOpen ? (
                                <div className="space-y-2">
                                  {day.hours.map((slot, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                                        <span className="font-medium text-gray-900">
                                          {formatTime(slot.open)} - {formatTime(slot.close)}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {Math.floor(
                                          (parseInt(slot.close.split(':')[0]) * 60 +
                                            parseInt(slot.close.split(':')[1]) -
                                            (parseInt(slot.open.split(':')[0]) * 60 +
                                              parseInt(slot.open.split(':')[1]))) /
                                            60
                                        )}
                                        h
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-500">
                                  <FiMoon className="mx-auto mb-2 text-gray-400" size={24} />
                                  <p>This day is currently closed</p>
                                </div>
                              )}
                            </div>

                            <div>
                              <h5 className="font-medium text-gray-900 mb-3">Day Summary</h5>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Status</span>
                                  <span className={`font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                    {isOpen ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Time Slots</span>
                                  <span className="font-medium text-gray-900">{day.hours.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Total Hours</span>
                                  <span className="font-medium text-gray-900">
                                    {day.hours
                                      .reduce((total, slot) => {
                                        const openMins =
                                          parseInt(slot.open.split(':')[0]) * 60 + parseInt(slot.open.split(':')[1]);
                                        const closeMins =
                                          parseInt(slot.close.split(':')[0]) * 60 + parseInt(slot.close.split(':')[1]);
                                        return total + (closeMins - openMins) / 60;
                                      }, 0)
                                      .toFixed(1)}
                                    h
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Show More/Less Toggle */}
          {schedule.length > 3 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAllDays(!showAllDays)}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center mx-auto"
              >
                {showAllDays ? 'Show Less' : `Show All ${schedule.length} Days`}
                <FiChevronDown className={`ml-2 transition-transform ${showAllDays ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              <p>
                Changes take effect immediately. All times are displayed in{' '}
                <span className="font-medium">{selectedTimezone.replace(/_/g, ' ')}</span>.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSchedule(defaultSchedule);
                  onScheduleChange?.(defaultSchedule, selectedTimezone);
                }}
                className="border-gray-300"
              >
                Reset to Default
              </Button>
              <Button
                onClick={() => {
                  // Save all changes
                  onScheduleChange?.(schedule, selectedTimezone);
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <FiCheck className="mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ServiceScheduleForm };
