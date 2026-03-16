export const normalizeEmail = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? '';

export const normalizeOptionalText = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};
