/**
 * A utility function to format the date.
 * '2025-11-10' -> 'Nov 10'
 */
export default function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Re-add timezone offset to get local date
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return localDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}