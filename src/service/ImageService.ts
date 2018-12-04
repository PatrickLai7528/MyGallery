import * as crypto from "crypto";
import * as fs from "fs";
import Database from "./../data/DataBase";
import DataStore from "../data/DataStore";
import Image from "../entity/Image";
import TagStatistics from "../entity/TagStatistics";
import AIService from "./AIService";
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
    private aIService: AIService;
    /**
     *Creates an instance of ImageService.
     * @memberof ImageService
     */
    public constructor() {
        this.database = null;
        this.fileBasePath = "";
        let database = DataStore.getInstance().get("database");
        this.aIService = new AIService();
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
            this.aIService.tagOf(imgData).then((autoTagList: string[]) => {
                let autoTagSplitBySpace: string = "";
                for (let autoTag of autoTagList) {
                    autoTagSplitBySpace += " " + autoTag;
                }
                tags += autoTagSplitBySpace;
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
        });
    }
    public countTag(username: string): Promise<TagStatistics> {
        return new Promise((resolve, reject) => {
            this.getAllImage()
                .then((imageList: Image[]) => {
                    let tagStatistics: TagStatistics = new TagStatistics();
                    for (let image of imageList) {
                        let tags: string[] = image.getTags().split(" ");
                        for (let tag of tags) {
                            tagStatistics.add(tag);
                        }
                    }
                    resolve(tagStatistics);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    public getAllImage(): Promise<Image[]> {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                reject(new Error("database is not ready"));
            } else {
                this.database
                    .getAllImage()
                    .then((images: Image[]) => {
                        resolve(images);
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }

    public getTagOf(imagePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                reject(new Error("database is not ready"));
            } else {
                this.database
                    .getTagOf(imagePath)
                    .then((tagList: string[]) => {
                        resolve(tagList);
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }
}
