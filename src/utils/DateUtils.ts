export class DateUtils {
  static parseDate(date: string): Date {
    return new Date(date)
  }

  static toISO(value: Date | string | undefined | null, fallback: string): string
  static toISO(value?: Date | string | null): string | undefined
  static toISO(value?: Date | string | null, fallback?: string): string | undefined {
    if (value == null || value === '') { return fallback }
    if (value instanceof Date) { return value.toISOString() }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) { return fallback }
    return date.toISOString()
  }
}
