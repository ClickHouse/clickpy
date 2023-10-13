


export function formatNumber(number){
    if (number > 1000000000) {
      return `${Math.round(Number(number)/10000000)/100}B`
    } else if (number > 1000000) {
      return `${Math.round(Number(number)/10000)/100}M`
    }
    return `${number}`
  }