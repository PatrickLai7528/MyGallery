import * as crypto from "crypto";
import * as fs from "fs";
import Database from "./../data/DataBase";
import DataStore from "../data/DataStore";
import Image from "../entity/Image";
// let request = require("request");
// let hashlib = require("hashlib");
// let urllib = require("urllib");
/**
 *
 *
 * @export
 * @class ImageService
 */
export default class ImageService {
  private database: Database | null;
  private fileBasePath: string | null;

  /**
   *Creates an instance of ImageService.
   * @memberof ImageService
   */
  public constructor() {
    this.database = null;
    this.fileBasePath = "";
    let database = DataStore.getInstance().get("database");
    if (database) this.database = database;
    else {
      Database.connect().then(database => {
        this.database = database;
        DataStore.getInstance().put("database", this.database);
        this.fileBasePath = "./upload_images";
      });
    }
  }

  /**
   *
   *
   * @private
   * @param {string} base64Image
   * @returns {string}
   * @memberof ImageService
   */
  private hashImageName(base64Image: string): string {
    const hash = crypto.createHash("md5");
    hash.update(base64Image);
    let ret = hash.digest("hex");
    if (ret.length > 30) ret = ret.substr(0, 30);
    return ret;
  }

  /**
   * @param username
   * @param base64Image
   */
  public upload(
    username: string,
    base64Image: string,
    tags: string
  ): Promise<string> {
    let imgData = base64Image.replace(/^data:image\/\w+;base64,/, "");

    let dataBuffer = new Buffer(imgData, "base64");
    //写入文件

    let imageName =
      this.fileBasePath + "/" + this.hashImageName(base64Image) + ".png";
    return new Promise((resolve, reject) => {
      // this.imageToText(base64Image);
      // write to file
      fs.writeFile(imageName, dataBuffer, err => {
        if (err) {
          // reject(err);
          reject(err);
        } else {
          //insert to database
          if (!this.database) {
            reject(new Error("database is not ready"));
          } else {
            this.database
              .insertImage(username, imageName, tags)
              .then((str: string) => {
                resolve(str);
              })
              .catch(err => {
                reject(err);
              });
          }
        }
      });
    });
  }

  // private imageToText(base64Image: string) {
  //   console.log("fuck you");
  //   this.call(base64Image);
  // }

  // private call(base64Image): void {
  //   const url = "https://api.ai.qq.com/fcgi-bin/vision/vision_imgtotext";
  //   const appKey = "3IttkQfLv2tmXaM1";
  //   const data = {
  //     app_id: "2108872588",
  //     image: base64Image,
  //     nonce_str: Math.random(),
  //     time_stamp: new Date().getTime()
  //   };

  //   data["sign"] = this.getSign(data, appKey);

  //   request.post({ url: url, body: data, json: true }, response => {
  //     console.log(response);
  //   });
  // }

  // private getSign(data, appKey) {
  //   // let s = urllib.urlencode(data);
  //   // s += "&app_key" + appKey;
  //   // let md5 = hashlib.md5();
  //   // md5.update(s.encode("utf-8"));
  //   // let digest = md5.hexdigest();
  //   // console.log(digest.upper());
  //   const hash = crypto.createHash("md5");
  //   hash.update(JSON.stringify(data));
  //   // let ret = hash.digest("hex");
  //   // if (ret.length > 30) ret = ret.substr(0, 30);
  //   // return ret;
  //   return hash.digest();
  // }

  public getAllImage(username: string): Promise<Image[]> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("database is not ready"));
      } else {
        this.database
          .getAllImage(username)
          .then((images: Image[]) => {
            resolve(images);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }
}
