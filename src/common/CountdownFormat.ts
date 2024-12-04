export class CountdownFormat {
  static readonly YEAR = 'Y'
  static readonly MONTH = 'M'
  static readonly WEEK = 'W'
  static readonly DAY = 'D'
  static readonly HOUR = 'H'
  static readonly MINUTE = 'm'
  static readonly SECOND = 's'
  static readonly MILLISECOND = 'c'
  static readonly FULL = 'YMWDHmsc'

  showYear = false
  showMonth = false
  showWeek = false
  showDay = false
  showHour = false
  showMinute = false
  showSecond = false
  showMillisecond = false

  constructor(
    showYear = false,
    showMonth = false,
    showWeek = false,
    showDay = false,
    showHour = false,
    showMinute = false,
    showSecond = false,
    showMillisecond = false,
  ) {
    this.showYear = showYear
    this.showMonth = showMonth
    this.showWeek = showWeek
    this.showDay = showDay
    this.showHour = showHour
    this.showMinute = showMinute
    this.showSecond = showSecond
    this.showMillisecond = showMillisecond
  }

  setByUnit(unit: string, show: boolean) {
    switch (unit) {
      case CountdownFormat.YEAR:
        this.showYear = show
        break
      case CountdownFormat.MONTH:
        this.showMonth = show
        break
      case CountdownFormat.WEEK:
        this.showWeek = show
        break
      case CountdownFormat.DAY:
        this.showDay = show
        break
      case CountdownFormat.HOUR:
        this.showHour = show
        break
      case CountdownFormat.MINUTE:
        this.showMinute = show
        break
      case CountdownFormat.SECOND:
        this.showSecond = show
        break
      case CountdownFormat.MILLISECOND:
        this.showMillisecond = show
        break
    }
  }

  static getDefault(): CountdownFormat {
    const format = new CountdownFormat()
    format.showYear = true
    format.showDay = true
    format.showHour = true
    format.showMinute = true
    format.showSecond = true
    return format
  }

  static getDaysOnly(): CountdownFormat {
    const format = new CountdownFormat()
    format.showDay = true
    return format
  }

  static fromString(str: string): CountdownFormat {
    if (!str || str.trim() === '') {
      return CountdownFormat.getDefault()
    }
    const format = new CountdownFormat()
    if (str.includes(CountdownFormat.YEAR)) { format.showYear = true }
    if (str.includes(CountdownFormat.MONTH)) { format.showMonth = true }
    if (str.includes(CountdownFormat.WEEK)) { format.showWeek = true }
    if (str.includes(CountdownFormat.DAY)) { format.showDay = true }
    if (str.includes(CountdownFormat.HOUR)) { format.showHour = true }
    if (str.includes(CountdownFormat.MINUTE)) { format.showMinute = true }
    if (str.includes(CountdownFormat.SECOND)) { format.showSecond = true }
    if (str.includes(CountdownFormat.MILLISECOND)) { format.showMillisecond = true }
    return format
  }

  toString(): string {
    const parts: string[] = []
    if (this.showYear) { parts.push(CountdownFormat.YEAR) }
    if (this.showMonth) { parts.push(CountdownFormat.MONTH) }
    if (this.showWeek) { parts.push(CountdownFormat.WEEK) }
    if (this.showDay) { parts.push(CountdownFormat.DAY) }
    if (this.showHour) { parts.push(CountdownFormat.HOUR) }
    if (this.showMinute) { parts.push(CountdownFormat.MINUTE) }
    if (this.showSecond) { parts.push(CountdownFormat.SECOND) }
    if (this.showMillisecond) { parts.push(CountdownFormat.MILLISECOND) }
    return parts.join('')
  }

  equals(other: CountdownFormat): boolean {
    return (
      this.showYear === other.showYear
      && this.showMonth === other.showMonth
      && this.showWeek === other.showWeek
      && this.showDay === other.showDay
      && this.showHour === other.showHour
      && this.showMinute === other.showMinute
      && this.showSecond === other.showSecond
      && this.showMillisecond === other.showMillisecond
    )
  }

  toPeriodType(): string[] {
    const period: string[] = []
    if (this.showYear) { period.push(CountdownFormat.YEAR) }
    if (this.showMonth) { period.push(CountdownFormat.MONTH) }
    if (this.showWeek) { period.push(CountdownFormat.WEEK) }
    if (this.showDay) { period.push(CountdownFormat.DAY) }
    if (this.showHour) { period.push(CountdownFormat.HOUR) }
    if (this.showMinute) { period.push(CountdownFormat.MINUTE) }
    if (this.showSecond) { period.push(CountdownFormat.SECOND) }
    if (this.showMillisecond) { period.push(CountdownFormat.MILLISECOND) }
    return period
  }
}

export interface CountdownFormatUnit {
  unit: string
  i18nKey: string
}
