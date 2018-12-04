/**
 * Module denpendencies
 */
import * as crypto from "crypto";
var querystring = require("querystring");
var request = require("request-promise");

var url = "https://api.seniverse.com/v3/";

interface Params {
  ts: number;
  ttl: number;
  uid: string;
}

export default class WeatherService {
  private uid: string;
  private secretKey: string;

  public constructor(uid: string, secretKey: string) {
    this.uid = uid;
    this.secretKey = secretKey;
  }

  private getSignatureParams(): Params {
    let params: Params = { ts: 0, ttl: 0, uid: "" };
    params.ts = Math.floor(new Date().getTime() / 1000); // 当前时间戳（秒）
    params.ttl = 300; // 过期时间
    params.uid = this.uid; // 用户ID

    var str = querystring.encode(params); // 构造请求字符串
    // 使用 HMAC-SHA1 方式，以 API 密钥（key）对上一步生成的参数字符串进行加密
    params["sig"] = crypto
      .createHmac("sha1", this.secretKey)
      .update(str)
      .digest("base64"); // 将加密结果用 base64 编码，并做一个 urlencode，得到签名 sig

    return params;
  }

  public getNowWeather(location: string): Promise<any> {
    var params = this.getSignatureParams();
    params["location"] = location;

    // 将构造的 URL 直接在后端 server 内调用
    return new Promise((resolve, reject) => {
      request({
        url: url + "weather/now.json",
        qs: params,
        json: true,
        success: function(response) {
          console.log(response);
          resolve(response);
        }
      });
    });
  }
}

// function Api(uid, secretKey) {
//   this.uid = uid;
//   this.secretKey = secretKey;
// }

// Api.prototype.getSignatureParams = function() {
//   let params: Params = { ts: 0, ttl: 0, uid: "", sig: "" };
//   params.ts = Math.floor(new Date().getTime() / 1000); // 当前时间戳（秒）
//   params.ttl = 300; // 过期时间
//   params.uid = this.uid; // 用户ID

//   var str = querystring.encode(params); // 构造请求字符串
//   // 使用 HMAC-SHA1 方式，以 API 密钥（key）对上一步生成的参数字符串进行加密
//   params.sig = crypto
//     .createHmac("sha1", this.secretKey)
//     .update(str)
//     .digest("base64"); // 将加密结果用 base64 编码，并做一个 urlencode，得到签名 sig

//   return params;
// };

// Api.prototype.getWeatherNow = function(location) {
//   var params = this.getSignatureParams();
//   params.location = location;

//   // 将构造的 URL 直接在后端 server 内调用
//   return request({
//     url: url + "weather/now.json",
//     qs: params,
//     json: true
//   });
// };

// module.exports = Api;
