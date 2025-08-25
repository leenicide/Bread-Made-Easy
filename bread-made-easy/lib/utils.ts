import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function exportToCSV(data: any[], filename: string) {
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => 
      Object.values(row).map(value => 
        `"${String(value || '').replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
