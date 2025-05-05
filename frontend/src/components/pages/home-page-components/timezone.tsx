import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const indoZones: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

export const getTimezoneLabelWithOffset = (tz: string): string => {
  if (tz in indoZones) return indoZones[tz];

  const now = dayjs().tz(tz);
  const offset = now.utcOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;

  const region = tz.split("/")[1]?.replace("_", " ") || tz;
  const utc = `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return `${region} (${utc})`;
};
