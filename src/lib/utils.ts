import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getServerBaseUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3457/api';
  // Remove /api suffix if present, since uploads are served at root /uploads
  return backendUrl.replace('/api', '');
};