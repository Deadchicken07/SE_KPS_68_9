export const receiptStatusOptions = [
  "pending_delivery",
  "delivered",
  "pending_pickup",
  "picked_up",
  "cancelled",
] as const;

export type ReceiptStatus = (typeof receiptStatusOptions)[number];

export const receiptStatusSelectOptions = [
  { label: "pending_delivery", value: "pending_delivery" },
  { label: "delivered", value: "delivered" },
  { label: "pending_pickup", value: "pending_pickup" },
  { label: "picked_up", value: "picked_up" },
  { label: "cancelled", value: "cancelled" },
] as const;

export const receiptStatusColorMap: Record<ReceiptStatus, string> = {
  pending_delivery: "gold",
  delivered: "green",
  pending_pickup: "orange",
  picked_up: "cyan",
  cancelled: "red",
};
