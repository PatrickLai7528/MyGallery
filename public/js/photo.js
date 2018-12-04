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

      let sortTagStastics = (obj) => {
            let retList = [];
            for (let i = 0; i < obj.length; i++) {
                  let tag = obj[i][0];
                  let count = obj[i][1];
                  if (!tag || !count)
                        continue;
                  retList.push({
                        tag: tag,
                        count: count
                  })
            }
            retList.sort((a, b) => {
                  return b.count - a.count;
            })
            console.log(retList);
            return retList;
      }

      let getTagStatistics = () => {
            $.ajax({
                  type: "GET",
                  url: "http://localhost:3000/tagstatistics/",
                  success: (response) => {
                        let jsonObj = JSON.parse(response);
                        console.log(jsonObj);
                        let colors = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "brown", "grey", "pink"]
                        let addHere = $(TAG_STATISTICS_ADD_HERE_SELECTOR)[0];
                        let tagList = sortTagStastics(jsonObj);
                        addHere.innerHTML = "";
                        for (let i = 0; i < tagList.length; i++) {
                              let tag = tagList[i];
                              // let tag = jsonObj[i][0];
                              // let count = jsonObj[i][1];

                              // if (!tag || !count)
                              // continue;

                              let labelDiv = document.createElement("div");
                              labelDiv.classList.add("label");
                              labelDiv.setAttribute("style", "font-family: Microsoft JhengHei, monospace;")
                              labelDiv.innerText = tag.tag;

                              let valueDiv = document.createElement("div");
                              valueDiv.classList.add("value");
                              valueDiv.innerText = tag.count;

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
                              },
                              success: (response) => {
                                    console.log(response);
                                    reloadImage();
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
            // if (!keyword || keyword == "") {
            showAll();
            // }
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

      let addOneImage = (addHere, src, tags, h1Id, imageId) => {
            let article = document.createElement("article");
            let img = document.createElement("img");
            let h1 = document.createElement("h1");
            h1.classList.add("article-title");
            h1.innerHTML = tags
            h1.setAttribute("id", h1Id);
            img.setAttribute("id", imageId);
            img.setAttribute("src", src);
            img.classList.add("article-img");
            article.appendChild(img);
            article.appendChild(h1);
            addHere.appendChild(article);
      }

      let reloadImage = () => {
            let $section = $(IMAGE_SECTION_SELECTOR)[0];
            $section.innerHTML = "";
            getImage();
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
                              let tags = imageList[i].tags
                              let src = "./showimage/" + imageList[i].path.replace("./upload_images/", "")
                              let h1Id = "img-tag-" + (1 + i);
                              let imageId = "img-" + (1 + i);
                              addOneImage($section, src, tags, h1Id, imageId);
                        }
                        $('img').click(function () {
                              localStorage['imgSrc'] = this.src;
                              $(location).attr('href', '/edit');
                        });
                  }
            })

      }

      getImage();
      setEventListener();
}