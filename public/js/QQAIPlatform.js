function postToPlatform(base64Image) {
      const url = "https://api.ai.qq.com/fcgi-bin/vision/vision_imgtotext";
      const appKey = '3IttkQfLv2tmXaM1';
      const data = {
            app_id: '2108872588',
            image: base64Image,
            nonce_str: str(random.random()),
            time_stamp: str(int(time.time())),
      }

      data.sign = getSign(data, appKey);

      $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: (response) => {
                  console.log(response);
            }
      })
}

function getSign(data, appKey) {
      let hashlib = require("hashlib");
      let urllib = require("urllib");
      let s = urllib.urlencode(data);
      s += "&app_key" + appKey;
      let md5 = hashlib.md5();
      md5.update(s.encode("utf-8"))
      let digest = md5.hexdigest();
      console.log(digest.upper());
      return digest.upper();
}

postToPlatform("123");