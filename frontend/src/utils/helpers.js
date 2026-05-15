import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

export const formatRelative = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const truncate = (str, n = 150) =>
  str?.length > n ? str.substring(0, n) + '...' : str;

export const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const countWords = (text) =>
  text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
