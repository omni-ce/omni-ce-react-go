export const getToken = (url: string) => {
  if (url.includes("/send/")) {
    return url.split("/send/")[1];
  } else if (url.includes("?token=")) {
    return url.split("?token=")[1];
  } else if (url.includes("/wpush/v2/")) {
    return url.split("/wpush/v2/")[1];
  }
  return "";
};

// Helper function to convert base64 to Uint8Array for VAPID key
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Utility function to format bytes
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const toZeroPadding = (num: number) => {
  return num.toString().padStart(2, "0");
};

export const toPascalCase = (str: string): string => {
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

export const booleanOnNullable = (value: boolean | null) => {
  return value === null || value === true ? true : false;
};

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
