import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const numberFormatter = new Intl.NumberFormat("en", {
  notation: "compact"
})

export function formatNumber(number) {
  return numberFormatter.format(number)
}

export function parseDate(date_string, default_value) {
  const value = dayjs(date_string, "YYYY-MM-DD")
  if (!isNaN(value.year()) && !isNaN(value.month()) && !isNaN(value.day())) {
    if (value.year() >= 1970 && value.year() < 2030) {
      return value.format("YYYY-MM-DD")
    }
    return default_value
  }
  return default_value
}

export function toValidStyleName(str) {
  return str
      .replace(/[^a-zA-Z0-9]/g, ' ') 
      .trim()
      .split(/\s+/)
      .map((word, index) => {
          if (index === 0) {
              return word.toLowerCase(); 
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); 
      })
      .join('');
}
