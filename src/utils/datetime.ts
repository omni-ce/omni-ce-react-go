import { toZeroPadding } from "@/utils/convert";

export const formatDateTime = (date: string) =>
  new Date(date)
    .toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\./g, ":");

export const formatDateTimeReverse = (date: string) => {
  const [dateString, timeString] = formatDateTime(date).split(", ");
  const fixDate = dateString.split("/").reverse().join("-");
  return `${fixDate}, ${timeString}`;
};

export const formatDate = (date: string) => {
  const [month, day, year] = new Date(date).toLocaleDateString().split("/");
  return `${year}-${toZeroPadding(Number(month))}-${toZeroPadding(Number(day))}`;
};

export const formatTimestamp = (
  ts: string,
  language: (t: { id: string; en: string }) => string,
): string => {
  const date = new Date(ts);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return language({ id: "Baru saja", en: "Just now" });
  if (minutes < 60)
    return `${minutes} ${language({ id: "menit lalu", en: "min ago" })}`;
  if (hours < 24)
    return `${hours} ${language({ id: "jam lalu", en: "hr ago" })}`;
  if (days < 7)
    return `${days} ${language({ id: "hari lalu", en: "days ago" })}`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const timeAgo = (
  ts: string,
  language: (t: { id: string; en: string }) => string,
): string => {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return language({ id: "Baru saja", en: "Just now" });
  if (minutes < 60)
    return `${minutes} ${language({ id: "menit lalu", en: "min ago" })}`;
  if (hours < 24)
    return `${hours} ${language({ id: "jam lalu", en: "hr ago" })}`;
  return `${days} ${language({ id: "hari lalu", en: "day ago" })}`;
};
