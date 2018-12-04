import * as crypto from "crypto";
var querystring = require("querystring");
var request = require("request");
// var axios = require("axios");
export default class AIService {
  private key: string = "3IttkQfLv2tmXaM1";
  private appId: string = "2108872588";

  public constructor() {}

  private ksort(params: any[]) {
    let arrayList: any[] = [],
      sort = (a, b) => {
        return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      };
    for (let key in params) {
      let temp = {};
      temp["key"] = key;
      temp["value"] = params[key];
      arrayList.push(temp);
    }
    return arrayList.sort(sort);
  }

  private getSign(params): string {
    let parList,
      sign,
      str = "";
    // 1. 字典升序排序
    parList = this.ksort(params);
    // 2. 拼按URL键值对
    parList.map(item => {
      if (item.value !== "") {
        str += `${item.key}=${querystring.escape(item.value)}&`;
      }
    });
    // 处理URL编码和java、PHP不一致的问题
    str = str.replace(/%20/g, "+");
    // 4. MD5运算+转换大写，得到请求签名
    sign = crypto
      .createHash("md5")
      .update(str + `app_key=${this.key}`, "utf8")
      .digest("hex")
      .toUpperCase();
    //console.log(sign)
    return sign;
  }

  public tagOf(base64Image: string): Promise<string[]> {
    const url = "https://api.ai.qq.com/fcgi-bin/image/image_tag";
    let data = {
      app_id: this.appId,
      image: base64Image,
      time_stamp: Math.floor(new Date().getTime() / 1000),
      nonce_str: Math.floor(new Date().getTime() / 1000)
    };

    data["sign"] = this.getSign(data);

    return new Promise((resolve, reject) => {
      request.post(
        {
          url: url,
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          form: data
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            let jsonObj = JSON.parse(body);
            let tagList: string[] = [];
            for (let tag of jsonObj["data"]["tag_list"]) {
              tagList.push(tag["tag_name"]);
            }
            console.log(tagList);
            resolve(tagList);
          } else {
            reject(error);
          }
        }
      );
    });
  }
}
