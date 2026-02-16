import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import './calendar.css';
import { useDateLocale } from '../../hooks/useDateLocale';

interface CalendarDateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabledBefore?: Date;
}

export function CalendarDateRangePicker({ from, to, onSelect, disabledBefore }: CalendarDateRangePickerProps) {
  const dateLocale = useDateLocale();
  const selected: DateRange | undefined = from ? { from, to } : undefined;

  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      disabled={disabledBefore ? { before: disabledBefore } : undefined}
      showOutsideDays={false}
      numberOfMonths={1}
      animate
      navLayout="around"
      locale={dateLocale}
    />
  );
}
