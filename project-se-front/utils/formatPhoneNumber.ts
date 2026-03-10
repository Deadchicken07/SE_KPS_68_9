export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 10);

  if (numbers.length <= 3) return numbers;

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
};