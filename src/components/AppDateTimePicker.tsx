import React from 'react';
import DatePicker from 'react-native-date-picker';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface AppDateTimePickerProps {
  visible: boolean;
  mode?: DateTimePickerMode;
  date?: Date;
  title?: string | null;
  confirmText?: string;
  cancelText?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  theme?: 'light' | 'dark' | 'auto';
  onConfirm: (selectedDate: Date) => void;
  onCancel: () => void;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Format a Date to "DD MMM YYYY" (e.g., "30 Oct 2026" or "8 Aug 1988")
 * or "MMM YYYY" (e.g., "Oct 2027")
 */
export const formatDate = (
  date: Date,
  format: 'DD MMM YYYY' | 'MMM YYYY' = 'DD MMM YYYY',
): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  if (format === 'MMM YYYY') {
    return `${month} ${year}`;
  }
  return `${day} ${month} ${year}`;
};

/**
 * Format a Date to "hh:mm A" (e.g., "10:00 AM", "06:30 PM")
 */
export const formatTime = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const strHours = hours < 10 ? `0${hours}` : `${hours}`;
  const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${strHours}:${strMinutes} ${ampm}`;
};

/**
 * Parse a date/time string like "30 Oct 2026", "8 Aug 1988", "Oct 2027", "10:00 AM" into a Date
 */
export const parseDateTimeString = (
  val?: string,
  mode: DateTimePickerMode = 'date',
): Date => {
  if (!val) {
    return new Date();
  }

  // Time string parser (e.g., "10:00 AM", "6:30 PM")
  if (mode === 'time') {
    const timeMatch = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = (timeMatch[3] || '').toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
  }

  // Month Year parser (e.g., "Oct 2027")
  const monthYearMatch = val.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthIdx = MONTH_NAMES.indexOf(monthYearMatch[1]);
    const year = parseInt(monthYearMatch[2], 10);
    if (monthIdx >= 0) {
      return new Date(year, monthIdx, 1);
    }
  }

  // Day Month Year parser (e.g., "30 Oct 2026", "8 Aug 1988")
  const dayMonthYearMatch = val.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (dayMonthYearMatch) {
    const day = parseInt(dayMonthYearMatch[1], 10);
    const monthIdx = MONTH_NAMES.indexOf(dayMonthYearMatch[2]);
    const year = parseInt(dayMonthYearMatch[3], 10);
    if (monthIdx >= 0) {
      return new Date(year, monthIdx, day);
    }
  }

  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const AppDateTimePicker: React.FC<AppDateTimePickerProps> = ({
  visible,
  mode = 'date',
  date = new Date(),
  title,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  minimumDate,
  maximumDate,
  minuteInterval,
  theme = 'dark',
  onConfirm,
  onCancel,
}) => {
  return (
    <DatePicker
      modal
      open={visible}
      date={date && !isNaN(date.getTime()) ? date : new Date()}
      mode={mode}
      theme={theme}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      minuteInterval={minuteInterval}
      onConfirm={(selectedDate) => {
        onConfirm(selectedDate);
      }}
      onCancel={onCancel}
    />
  );
};

export default AppDateTimePicker;

