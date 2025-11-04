import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatCurrency = (amount: number, currency: string = "USD") => {
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol || "$";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatDate = (date: string | Date) => {
  return dayjs(date).format("MMM DD, YYYY");
};

export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format("MMM DD, YYYY HH:mm");
};

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const getDaysRemaining = (deadline: string | Date) => {
  const now = dayjs();
  const end = dayjs(deadline);
  return end.diff(now, "day");
};

export const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const getAlertColor = (level: string) => {
  return ALERT_COLORS[level as keyof typeof ALERT_COLORS] || "gray";
};
