let main = () => {
      let UPLOAD_SELCETOR = ".tiny.ui.orange.button";
      let UPLOAD_BUTTON_SELECTOR = ".inputfile";
      let UPLOAD_TAG_INPUT_SELECTOR = "#tag-input";

      let UPLOAD_MODAL_SELECTOR = "#upload-image-modal"

      let SEARCH_ICON_SELECTOR = ".search.link.icon"
      let SEARCH_KEYWORD_INPUT_SELECTOR = "#search-keyword-input"

      let IMAGE_SECTION_SELECTOR = "#image-section";
      let IMAGE_ARTICLE_SELECTOR = "#image-section article"
      let IMAGE_ARTICLE_TAG_SELECTOR = "#img-tag-"

      let TAG_STATISTICS_SELECTOR = ".tiny.ui.yellow.button"
      let TAG_STATISTICS_MODAL_SELECTOR = "#tag-statistics-modal"
      let TAG_STATISTICS_ADD_HERE_SELECTOR = "#tag-statistics-add-here"

      let getTagStatistics = () => {
            $.ajax({
                  type: "GET",
                  url: "http://localhost:3000/tagstatistics/",
                  success: (response) => {
                        let jsonObj = JSON.parse(response);
                        console.log(jsonObj);
                        let colors = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "brown", "grey", "pink"]
                        let addHere = $(TAG_STATISTICS_ADD_HERE_SELECTOR)[0];
                        addHere.innerHTML = "";
                        for (let i = 0; i < jsonObj.length; i++) {
                              let tag = jsonObj[i][0];
                              let count = jsonObj[i][1];

                              if (!tag || !count)
                                    continue;

                              let labelDiv = document.createElement("div");
                              labelDiv.classList.add("label");
                              labelDiv.setAttribute("style", "font-family: Microsoft JhengHei, monospace;")
                              labelDiv.innerText = tag;

                              let valueDiv = document.createElement("div");
                              valueDiv.classList.add("value");
                              valueDiv.innerText = count;

                              let statisticsDiv = document.createElement("div");
                              statisticsDiv.classList.add(colors[i % colors.length])
                              statisticsDiv.classList.add("statistic");

                              statisticsDiv.appendChild(valueDiv);
                              statisticsDiv.appendChild(labelDiv);

                              addHere.appendChild(statisticsDiv);
                        }
                        $(TAG_STATISTICS_MODAL_SELECTOR).modal('setting', 'transition', "vertical flip").modal("show");
                  }
            })
      }

      let opUploadImage = (e) => {
            e.preventDefault();
            //判断是否支持FileReader
            let selectedFiles = $(UPLOAD_BUTTON_SELECTOR)[0].files;

            console.log(selectedFiles);
            let uploadOneImage = (selectedFile) => {
                  let reader = new FileReader();
                  //读取完成
                  reader.onload = function (e) {
                        let base64Image = e.target.result;
                        let tags = $(UPLOAD_TAG_INPUT_SELECTOR).val();
                        console.log(tags);
                        let uploadData = {
                              image: base64Image,
                              tags: tags
                        }
                        $.ajax({
                              url: "http://localhost:3000/upload/image",
                              type: "POST",
                              data: {
                                    data: JSON.stringify(uploadData)
                              }
                        });
                  };
                  reader.readAsDataURL(selectedFile);
            }

            for (let selectedFile of selectedFiles) {
                  console.log("upload " + selectedFile);
                  uploadOneImage(selectedFile);
            }
      };

      let showAll = () => {
            let jqImageArticles = $(IMAGE_ARTICLE_SELECTOR);
            for (let i = 0; i < jqImageArticles.length; i++) {
                  jqImageArticles[i].setAttribute("style", "display:inline");
            }
      }

      let doSearch = (keyword) => {
            if (!keyword || keyword == "") {
                  showAll();
            }
            console.log(keyword);
            let jqImageArticles = $(IMAGE_ARTICLE_SELECTOR);
            for (let i = 0; i < jqImageArticles.length; i++) {
                  let tags = $(IMAGE_ARTICLE_TAG_SELECTOR + (i + 1)).text();
                  console.log(tags);
                  if (tags.indexOf(keyword) !== -1) {
                        continue;
                  } else {
                        jqImageArticles[i].setAttribute("style", "display:none");
                  }
            }
            clearSearchInput();
      }

      let clearSearchInput = () => {
            $(SEARCH_KEYWORD_INPUT_SELECTOR).val("");
      }

      let setEventListener = () => {
            $('img').click(function () {
                  localStorage['imgSrc'] = this.src;
                  $(location).attr('href', '/edit');
            });
            $(".tiny.ui.teal.button").click(function () {
                  $.ajax({
                        url: "http://localhost:3000/logout",
                        type: "GET",
                        success: function (response) {
                              response = JSON.parse(response);
                              console.log(response);
                              if (response.isValid) {
                                    document.cookie = "token=" + response.token + ";"
                                    $(location).attr('href', '/');
                              }
                        }
                  })
            })
            $(UPLOAD_SELCETOR).click((e) => {
                  e.preventDefault();
                  $(UPLOAD_TAG_INPUT_SELECTOR).val("");
                  $(UPLOAD_MODAL_SELECTOR).modal('setting', 'transition', "vertical flip").modal("show");
            });
            $(UPLOAD_BUTTON_SELECTOR).on("change", (e) => {
                  opUploadImage(e);
            });
            $(SEARCH_ICON_SELECTOR).click((e) => {
                  e.preventDefault();
                  doSearch($(SEARCH_KEYWORD_INPUT_SELECTOR).val());
            })
            $(TAG_STATISTICS_SELECTOR).click(e => {
                  e.preventDefault();
                  getTagStatistics();
            })
      }

      let getImage = () => {
            // get image from backend
            $.ajax({
                  type: "GET",
                  url: "http://localhost:3000/images",
                  success: function (response) {
                        console.log(response);
                        let imageList = JSON.parse(response);
                        console.log(imageList);
                        let $section = $(IMAGE_SECTION_SELECTOR)[0];
                        console.log($section);
                        for (let i = 0; i < imageList.length; i++) {
                              let article = document.createElement("article");
                              let img = document.createElement("img");
                              let h1 = document.createElement("h1");
                              h1.classList.add("article-title");
                              h1.innerHTML = imageList[i].tags;
                              h1.setAttribute("id", "img-tag-" + (10 + i));
                              img.setAttribute("id", "img-" + (10 + i));
                              img.setAttribute("src", "./showimage/" + imageList[i].path.replace("./upload_images/", ""));
                              img.classList.add("article-img");
                              article.appendChild(img);
                              article.appendChild(h1);
                              $section.appendChild(article);
                        }
                        $('img').click(function () {
                              localStorage['imgSrc'] = this.src;
                              $(location).attr('href', '/edit');
                        });
                  }
            })

      }

      let getWeather = () => {
            // /******** 本示例仅做开发参考使用，不建议在生产环境下暴露 key！ ********/
            // var UID = "U44148E02B"; // 测试用 用户ID，请更换成您自己的用户ID
            // var KEY = "uozhik5x6jgiumgn"; // 测试用key，请更换成您自己的 Key
            // var API = "http://api.seniverse.com/v3/weather/now.json"; // 获取天气实况
            // var LOCATION = "beijing"; // 除拼音外，还可以使用 v3 id、汉语等形式
            // // 获取当前时间戳
            // var ts = Math.floor((new Date()).getTime() / 1000);
            // // 构造验证参数字符串
            // var str = "ts=" + ts + "&uid=" + UID;
            // // 使用 HMAC-SHA1 方式，以 API 密钥（key）对上一步生成的参数字符串（raw）进行加密
            // // 并将加密结果用 base64 编码，并做一个 urlencode，得到签名 sig
            // var sig = CryptoJS.HmacSHA1(str, KEY).toString(CryptoJS.enc.Base64);
            // sig = encodeURIComponent(sig);
            // str = str + "&sig=" + sig;
            // var jsonpCallback = function (data) {
            //       var obj = document.getElementById('content');
            //       var weather = data.results[0];
            //       var text = [];
            //       text.push("Location: " + weather.location.path);
            //       text.push("Weather: " + weather.now.text);
            //       text.push("Temperature: " + weather.now.temperature);
            //       obj.innerText = text.join("\n");
            // }
            // // 构造最终请求的 url
            // var url = API + "?location=" + LOCATION + "&" + str + "&callback=jsonpCallback";
            // // 向 HTML 中动态插入 script 标签，通过 JSONP 的方式进行调用
            // var newScript = document.createElement('script');
            // newScript.type = 'text/javascript';
            // newScript.src = url;
            // $('body').append(newScript);
      }

      getImage();
      setEventListener();
      getWeather();
}