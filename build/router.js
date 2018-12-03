"use strict";
/* app/controllers/welcome.controller.ts */
Object.defineProperty(exports, "__esModule", { value: true });
// Import only what we need from express
const express_1 = require("express");
const BodyParser = require("body-parser");
const UserService_1 = require("./service/UserService");
const ImageService_1 = require("./service/ImageService");
// Assign router to the express.Router() instance
const router = express_1.Router();
router.get("/login/:username/:password", (req, res) => {
    let username = req.params.username;
    let pw = req.params.password;
    let userService = new UserService_1.default();
    console.log(req.params);
    // let onSuccess = (result) => {
    // 	res.end(JSON.stringify(result))
    // };
    // let onError = (error) => {
    // 	res.end(JSON.stringify(error))
    // };
    userService
        .login(username, pw)
        .then((result) => {
        res.end(JSON.stringify(result));
    })
        .catch(error => {
        res.end(JSON.stringify(error));
    });
});
router.post("/signup/:username/:password", (req, res) => {
    let username = req.params.username;
    let pw = req.params.password;
    let userService = new UserService_1.default();
    //   let onError = error => {
    //     res.end(JSON.stringify(error));
    //   };
    //   let onSuccess = result => {
    //     res.end(JSON.stringify(result));
    //   };
    userService
        .signUp(username, pw)
        .then((result) => {
        res.end(JSON.stringify(result));
    })
        .catch(error => {
        res.end(JSON.stringify(error));
    });
});
router.post("/upload/image/", BodyParser.json(), function (req, res) {
    // console.log(req.body);
    const base64Image = req.body.image;
    const imageService = new ImageService_1.default();
    //   let onSuccess = result => {
    //     res.end(JSON.stringify(result));
    //   };
    //   let onError = error => {
    //     res.end(JSON.stringify(error));
    //   };
    imageService
        .upload(base64Image)
        .then((imageName) => {
        res.end(JSON.stringify("upload success"));
    })
        .catch(error => {
        res.end(JSON.stringify(error));
    });
});
exports.default = router;
