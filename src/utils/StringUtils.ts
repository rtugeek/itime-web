export class StringUtils {
  /**
   * 生成随机字符串
   */
  static generateNonceStr(length: number = 10) {
    return Math.random().toString(36).substring(2, length + 2)
  }

}
