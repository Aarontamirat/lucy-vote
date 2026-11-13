export const formatNumber = (value: string | number, digits = 2) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: digits }).format(
    Number(value),
  );
export const formatDate = (value: string | Date, time = false) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
    ...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(value));
