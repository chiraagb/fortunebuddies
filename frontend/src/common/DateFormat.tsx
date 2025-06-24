export function DateFormat(
  isoString: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(isoString);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    weekday: "long", // Sunday
    year: "numeric", // 2025
    month: "long", // June
    day: "numeric", // 29
    hour: "numeric", // 2 PM
    minute: "2-digit",
    hour12: true,
  };

  const formatOptions = { ...defaultOptions, ...options };

  return date.toLocaleString("en-IN", formatOptions);
}
