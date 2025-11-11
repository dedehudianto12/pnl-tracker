export const EXPENSE_CATEGORIES = [
  { value: "MATERIALS", label: "Materials" },
  { value: "MANPOWER", label: "Manpower" },
  { value: "TOOLS", label: "Tools" },
  { value: "OTHER", label: "Other" },
] as const;

export const PROJECT_STATUS = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "ACTIVE", label: "Active", color: "green" },
  { value: "COMPLETED", label: "Completed", color: "blue" },
  { value: "ARCHIVED", label: "Archived", color: "red" },
] as const;

export const MILESTONE_STATUS = [
  { value: "PENDING", label: "Pending", color: "gray" },
  { value: "IN_PROGRESS", label: "In Progress", color: "blue" },
  { value: "COMPLETED", label: "Completed", color: "green" },
  { value: "DELAYED", label: "Delayed", color: "red" },
] as const;

export const ALERT_COLORS = {
  info: "blue",
  warning: "yellow",
  danger: "orange",
  critical: "red",
} as const;

export const CURRENCIES = [
  //   { value: "USD", label: "USD ($)", symbol: "$" },
  //   { value: "EUR", label: "EUR (€)", symbol: "€" },
  //   { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "IDR", label: "IDR (Rp)", symbol: "Rp" },
] as const;
