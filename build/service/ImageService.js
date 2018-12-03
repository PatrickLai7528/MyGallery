"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs");
const DataBase_1 = require("./../data/DataBase");
const DataStore_1 = require("../data/DataStore");
// let DataStore = require("./../data/DataStore.js");
// let DataBase = require("./../data/DataBase.js");
// let fs = require("fs");
// let crypto = require("crypto");
class ImageService {
    constructor() {
        this.database = null;
        this.fileBasePath = "";
        // this.database = DataBase.connect(onSuccess, onError);
        let database = DataStore_1.default.getInstance().get("database");
        if (database)
            this.database = database;
        else {
            console.log("123");
            DataBase_1.default.connect().then(database => {
                this.database = database;
                DataStore_1.default.getInstance().put("database", this.database);
                this.fileBasePath = "./upload_images";
            });
        }
    }
    hashImageName(base64Image) {
        const hash = crypto.createHash("md5");
        hash.update(base64Image);
        let ret = hash.digest("hex");
        if (ret.length > 30)
            ret = ret.substr(0, 30);
        return ret;
    }
    upload(base64Image) {
        let imgData = base64Image.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = new Buffer(imgData, "base64");
        //写入文件
        let imageName = this.fileBasePath + "/" + this.hashImageName(base64Image) + ".png";
        return new Promise((resolve, reject) => {
            fs.writeFile(imageName, dataBuffer, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(imageName);
                    // console.log("upload" + imageName);
                }
            });
        });
    }
}
exports.default = ImageService;
// module.exports = ImageService;
