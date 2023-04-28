export default function Select({
  values,
}: {
  values: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        Select an option
      </label>
      <select className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
        <option selected>Choose a default</option>
        {values.map((value, index) => (
          <option key={index} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
    </div>
  );
}
