import * as BodyParser from "body-parser";
import ImageService from "./service/ImageService";
import User from "./entity/User";
import UserService from "./service/UserService";
import { Request, Response, Router } from "express";
import Image from "./entity/Image";
import TagStatistics from "./entity/TagStatistics";
const jwt = require("jsonwebtoken");
const secret = "SUPER_GALLERY";
const fs = require("fs");
const router: Router = Router();
const userService = new UserService();
const imageService = new ImageService();

/**
 * @param {Request} req
 * @param {Response} res
 * @param {string} url
 */
function checkToken(
  req: Request,
  res: Response,
  url: string | null,
  errorUrl: string = "/redirect"
): User | null {
  const token: string | undefined = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      if (decoded.isLogin) {
        if (url) {
          res.sendfile(url);
        } else {
          return new User(decoded.username, decoded.password);
        }
      } else {
        res.redirect(errorUrl);
      }
    } catch (err) {
      console.log(err);
      res.redirect(errorUrl);
      return null;
    }
  }
  return null;
}

function getUsernameFromToken(token: string): string {
  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.isLogin) {
      return decoded.username;
    }
  } catch (err) {
    console.log(err);
  }
  return "";
}

router.get("/redirect", (req: Request, res: Response) => {
  res.sendfile("public/pages/redirect.html");
});

router.get("/index", (req: Request, res: Response) => {
  res.sendfile("public/index.html");
});

router.get("/photo", (req: Request, res: Response) => {
  checkToken(req, res, "public/pages/photo.html");
});

router.get("/edit", (req: Request, res: Response) => {
  checkToken(req, res, "public/pages/edit.html");
});

router.get("/logout", (req: Request, res: Response) => {
  const user: User | null = checkToken(req, res, null);

  if (!user) {
    res.redirect("public/pages/redirect.html");
  } else {
    const token = jwt.sign(
      {
        loginTime: Date.now(),
        username: user.getUsername(),
        password: user.getPassword(),
        isLogin: false
      },
      secret,
      { expiresIn: "1h" }
    );
    res.end(
      JSON.stringify({
        isValid: true,
        message: "logout success",
        token: token
      })
    );
  }
});

router.get("/login/:username/:password", (req: Request, res: Response) => {
  let username = req.params.username;
  let pw = req.params.password;

  userService
    .login(username, pw)
    .then((result: string) => {
      const token = jwt.sign(
        {
          loginTime: Date.now(),
          username: username,
          password: pw,
          isLogin: true
        },
        secret,
        { expiresIn: "1h" }
      );
      res.end(
        JSON.stringify({
          isValid: true,
          message: "login success",
          token: token
        })
      );
    })
    .catch(error => {
      res.end(JSON.stringify({ isValid: false, message: "Account not match" }));
    });
});

router.post("/signup/:username/:password", (req: Request, res: Response) => {
  let username = req.params.username;
  let pw = req.params.password;
  userService
    .signUp(username, pw)
    .then((result: string) => {
      res.end(JSON.stringify({ isValid: true, message: "Sigup Success" }));
    })
    .catch(error => {
      console.log(error);
      res.end(JSON.stringify({ isValid: false, message: "Username repeated" }));
    });
});

router.post(
  "/upload/image/",
  BodyParser.json(),
  (req: Request, res: Response) => {
    const username: string = getUsernameFromToken(req.cookies.token);
    // console.log(req.body.data);
    const data = JSON.parse(req.body.data);
    const tags = data.tags;
    const base64Image = data.image;
    imageService
      .upload(username, base64Image, tags)
      .then((imageName: string) => {
        res.end(JSON.stringify("upload success"));
      })
      .catch(error => {
        res.end(JSON.stringify(error));
      });
  }
);

router.get("/images/", BodyParser.json(), (req: Request, res: Response) => {
  const username: string = getUsernameFromToken(req.cookies.token);
  imageService
    .getAllImage(username)
    .then((images: Image[]) => {
      // console.log(images);
      res.end(JSON.stringify(images));
    })
    .catch(err => {
      res.end(JSON.stringify(err));
    });
});

router.get(
  "/tagstatistics/",
  BodyParser.json(),
  (req: Request, res: Response) => {
    const username: string = getUsernameFromToken(req.cookies.token);
    imageService
      .countTag(username)
      .then((tagStatistics: TagStatistics) => {
        // console.log(images);
        // console.log(tagStatistics.getStatistics());
        res.end(JSON.stringify([...tagStatistics.getStatistics()]));
      })
      .catch(err => {
        res.end(JSON.stringify(err));
      });
  }
);

router.get(
  "/showimage/:imagePath",
  BodyParser.json(),
  (req: Request, res: Response) => {
    let imagePath = req.params.imagePath;
    // console.log(imagePath);
    imagePath = "./upload_images/" + imagePath;
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    if (req.url !== "/favicon.ico") {
      fs.readFile(imagePath, "binary", function(err, file) {
        if (err) {
          console.log(err);
          return;
        } else {
          console.log("输出文件");
          res.write(file, "binary");
          res.end();
        }
      });
      console.log("继续执行");
    }
  }
);
export default router;
