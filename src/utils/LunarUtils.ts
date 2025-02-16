import { Lunar, LunarMonth } from 'lunar-typescript'
import type { Solar } from 'lunar-typescript'
import dayjs from 'dayjs'

export class LunarUtils {
  private static CHINESE_NUMBER = '〇一二三四五六七八九十'
  static getLunarMonthText(month: number): string {
    const arr: string[] = []
    if (month < 0) {
      arr.push('闰')
    }
    if (month == 10) {
      arr.push('十')
    }
    else {
      if (month > 10) {
        arr.push('十')
      }
      arr.push(this.CHINESE_NUMBER[Math.abs(month) % 10])
    }

    arr.push('月')
    return arr.join('')
  }

  /**
   * 1-10  初一 初二 初三 初四 初五 初六 初七 初八 初九 初十
   * 11-20 十一 十二 十三 十四 十五 十六 十七 十八 十九 二十
   * 21-30 廿一 廿二 廿三 廿四 廿五 廿六 廿七 廿八 廿九 三十
   * @param day
   */
  static getLunarDayText(day: number) {
    const arr: string[] = []
    if (day < 10) {
      arr.push('初', this.CHINESE_NUMBER[day % 10])
    }
    else if (day == 10) {
      arr.push('初十')
    }
    else if (day === 20) {
      arr.push('二十')
    }
    else if (day > 20 && day < 30) {
      arr.push('廿', this.CHINESE_NUMBER[day % 10])
    }
    else if (day === 30) {
      arr.push('三十')
    }
    else {
      arr.push('十', this.CHINESE_NUMBER[day % 10])
    }
    return arr.join('')
  }

  static lunarToDate(lunar: Lunar): Date {
    return this.solarToDate(lunar.getSolar())
  }

  static lunarToDayJS(lunar: Lunar): dayjs.Dayjs {
    return dayjs(this.lunarToDate(lunar))
  }

  static isBeforeNow(lunar: Lunar) {
    return this.lunarToDayJS(lunar).isBefore(dayjs())
  }

  static solarToDate(solar: Solar): Date {
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay())
  }

  static addYear(lunar: Lunar) {
    const year = lunar.getYear()
    const month = lunar.getMonth()
    const dayOfMonth = lunar.getDay()
    return this.fromYmd(year + 1, month, dayOfMonth)
  }

  static addMonth(lunar: Lunar) {
    const year = lunar.getYear()
    const month = lunar.getMonth()
    const dayOfMonth = lunar.getDay()
    return this.fromYmd(year, month + 1, dayOfMonth)
  }

  static isToday(lunar: Lunar) {
    const today = Lunar.fromDate(new Date())
    return lunar.getYear() == today.getYear()
      && lunar.getMonth() == today.getMonth()
      && lunar.getDay() == today.getDay()
  }

  static fromYmd(year: number, month: number, dayOfMonth: number) {
    let addYear = 0
    let addMonth = month
    if (month > 12) {
      addYear = Math.floor(month / 12)
      addMonth = month % 12
    }
    const lunarMonth = LunarMonth.fromYm(year, addMonth)
    const lastDay = lunarMonth!.getDayCount()
    return Lunar.fromYmd(year + addYear, addMonth, dayOfMonth > lastDay ? lastDay : dayOfMonth)
  }

  static dateToLunar(date: Date) {
    return Lunar.fromDate(date)
  }
}
