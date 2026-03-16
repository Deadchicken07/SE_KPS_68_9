export const receiptStatusOptions = [
  "pending",
  "delivered",
  "picked_up",
  "cancelled",
] as const;

export type ReceiptStatus = (typeof receiptStatusOptions)[number];

export const receiptStatusSelectOptions = receiptStatusOptions.map((status) => ({
  label: status,
  value: status,
}));

export const receiptStatusColorMap: Record<ReceiptStatus, string> = {
  pending: "gold",
  delivered: "green",
  picked_up: "cyan",
  cancelled: "red",
};
