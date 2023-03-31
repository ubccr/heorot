// Take an input value plus its unit and return a formatted string
// ex: formatReadable(1024) = "1 kB"
export default function formatReadable(input_value, round_to = 2, input_type = "B") {
  const units_bytes = ["B", "kB", "MB", "GB", "TB", "PB"]
  if (typeof input_value !== "number") return "Invalid input! Type must be a number."
  if (input_value < 1) return `${input_value.toFixed(round_to)} ${input_type}`

  if (input_type === "MB") units_bytes.splice(0, 2)

  const exponent = Math.min(Math.floor(Math.log10(input_value) / 3), units_bytes.length - 1)
  return `${(input_value / 1024 ** exponent).toFixed(round_to)} ${units_bytes[exponent]}`
}
