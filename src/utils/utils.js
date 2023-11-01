const numberFormatter = new Intl.NumberFormat("en", {
  notation: "compact"
})

export function formatNumber(number) {
  return numberFormatter.format(number)
}
