import { addDays, isWeekend } from 'date-fns';

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  let currentDate = startDate;

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate = addDays(currentDate, 1);
  }

  return workingDays;
}