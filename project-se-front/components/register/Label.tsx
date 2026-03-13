export default function Label({ text }: { text: string }) {
  return (
    <label className="text-sm font-medium text-gray-600">
      {text} <span className="text-red-500">*</span>
    </label>
  );
}