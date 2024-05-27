import md5 from 'md5'

export class SignatureUtils {
  /**
   * Generate signature using bcrypt encryption with appKey as salt,
   * and then use md5 to generate the final signature.
   *
   * @param requestParams Parameter map
   * @param appKey        Application key
   * @param timestamp     Timestamp
   * @param nonce         Random string
   * @returns Signature value
   */
  public static sign(requestParams: Record<string, string|string[]>, appKey: string, timestamp: string, nonce: string): string {
    if (nonce.length !== 10) {
      throw new Error("nonce length must be 10");
    }
    if (!appKey) {
      throw new Error("appKey must not be empty");
    }
    if (!timestamp) {
      throw new Error("timestamp must not be empty");
    }

    const dateTime = new Date(parseInt(timestamp));
    if (dateTime.setMinutes(dateTime.getMinutes() + 60) < Date.now()) {
      throw new Error("timestamp is expired");
    }

    const params: Record<string, string> = {};
    for (const key in requestParams) {
      if (Object.prototype.hasOwnProperty.call(requestParams, key)) {
        const values = requestParams[key];
        if (Array.isArray(values)) {
          if (values.length >= 0) {
            params[key] = values.join(",");
          }
        }else{
          params[key] = values;
        }
      }
    }
    params["appKey"] = appKey;
    params["timestamp"] = timestamp;
    params["nonce"] = nonce;

    const keys = Object.keys(params).sort();
    const str = keys.map(key => params[key]).join("+");
    return md5(str+nonce).toUpperCase();
  }

}
