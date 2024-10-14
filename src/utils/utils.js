import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact"
})

export function formatNumberWithDescription(number) {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(2) + " billion";
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(2) + " million";
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(2) + " thousand";
  } else {
    return number.toString();
  }
}

export function formatNumber(number) {
  return compactNumberFormatter.format(number)
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
