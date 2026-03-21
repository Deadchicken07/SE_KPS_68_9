export default function Label({ text }: { text: string }) {
  return (
    <label className="mb-2 block text-sm font-medium leading-6 text-gray-600">
      {text} <span className="text-red-500">*</span>
    </label>
  );
}
