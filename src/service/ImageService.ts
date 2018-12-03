import * as crypto from "crypto";
import * as fs from "fs";
import Database from "./../data/DataBase";
import DataStore from "../data/DataStore";

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
   *
   *
   * @param {string} base64Image
   * @returns {Promise<string>}
   * @memberof ImageService
   */
  public upload(base64Image: string): Promise<string> {
    let imgData = base64Image.replace(/^data:image\/\w+;base64,/, "");

    let dataBuffer = new Buffer(imgData, "base64");
    //写入文件

    let imageName =
      this.fileBasePath + "/" + this.hashImageName(base64Image) + ".png";

    return new Promise((resolve, reject) => {
      fs.writeFile(imageName, dataBuffer, function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(imageName);
          resolve(imageName);
        }
      });
    });
  }
}

