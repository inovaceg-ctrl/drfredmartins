import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions for date formatting (dd/mm/yyyy)
export const formatDateToDisplay = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    // Assuming dateString is "YYYY-MM-DD" from Supabase
    const parts = dateString.split('-').map(Number);
    if (parts.length === 3) {
      const [year, month, day] = parts;
      // Create a Date object in the local timezone to avoid timezone issues
      const date = new Date(year, month - 1, day); // month is 0-indexed
      
      if (isNaN(date.getTime())) return "";
      return format(date, "dd/MM/yyyy"); // Format for display
    }
    return ""; // Invalid dateString format
  } catch {
    return "";
  }
};

export const parseDateFromInput = (inputString: string): string | null => {
  if (!inputString) return null;
  // Expecting dd/mm/yyyy
  const parts = inputString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    
    // Basic validation for day, month, year ranges
    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      return null; // Invalid date components
    }

    const date = new Date(year, month, day); // This creates a Date object in local timezone
    // Check for valid date and prevent invalid dates like Feb 30th
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return format(date, "yyyy-MM-dd"); // Return YYYY-MM-DD for internal state and DB
    }
  }
  return null; // Invalid format or invalid date
};