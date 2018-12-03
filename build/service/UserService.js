"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const DataBase_1 = require("../data/DataBase");
const DataStore_1 = require("../data/DataStore");
const User_1 = require("../entity/User");
class UserService {
    constructor() {
        this.database = null;
        // this.database = DataBase.connect(onSuccess, onError);
        let database = DataStore_1.default.getInstance().get("database");
        if (database)
            this.database = database;
        else {
            // let onSuccess = () => {
            // 	console.log("database connect success");
            // };
            // let onError = () => {
            // 	console.log("database connect fail");
            // };
            // this.database = Database.connect(onSuccess, onError);
            // DataStore.getInstance().put("database", this.database);
            DataBase_1.default.connect().then(database => {
                this.database = database;
                DataStore_1.default.getInstance().put("database", this.database);
            });
        }
    }
    fromPasswordToHash(pw) {
        const hash = crypto.createHash("md5");
        hash.update(pw);
        let ret = hash.digest("hex");
        return ret;
    }
    login(username, pw) {
        // const hashedPassword = this.fromPasswordToHash(pw);
        // let myOnSuccess = result => {
        //   let isSuccess = false;
        //   for (let account of result) {
        //     if (hashedPassword === account.password) {
        //       isSuccess = true;
        //       break;
        //     }
        //   }
        //   if (isSuccess) onSuccess({ isValid: true, message: "login success" });
        //   else onError({ isValid: false, message: "no match password" });
        // };
        // let myOnError = error => {
        //   console.log(error);
        //   onError({ isValid: false, message: "database failed" });
        // };
        // // this.database.selectUser(myOnSuccess, myOnError, username);
        const hashedPassword = this.fromPasswordToHash(pw);
        return new Promise((resolve, reject) => {
            if (!this.database) {
                reject(false);
            }
            else {
                this.database.selectUser(username).then((userList) => {
                    let isSuccess = false;
                    // console.log(userList);
                    for (let i = 0; i < userList.length; i++) {
                        let account = userList[i];
                        console.log(account);
                        if (hashedPassword === account.getPassword()) {
                            isSuccess = true;
                            break;
                        }
                    }
                    if (isSuccess) {
                        resolve("login success");
                    }
                    else {
                        reject(false);
                    }
                });
            }
        });
        //   return new Promise<User>((resolve, rejct) => {
        // 	const hashedPassword = this.fromPasswordToHash(pw);
        // 	let isSuccess = false;
        // 	  for (let account of userList) {
        // 	    if (hashedPassword === account.getPassword()) {
        // 	      isSuccess = true;
        // 	      break;
        // 	    }
        // 	  }
        // 	  if(isSuccess){
        // 		  resolve()
        // 	  }
        //   });
        // })
    }
    signUp(username, pw) {
        // let myOnSuccess = result => {
        //   onSuccess({ isValid: true, message: "sign up success" });
        // };
        // let myOnError = error => {
        //   onError({ isValid: false, message: "sign up fail" });
        // };
        // this.database.insertUser(myOnSuccess, myOnError, currentUser);
        return new Promise((resolve, reject) => {
            if (!this.database) {
                reject(false);
            }
            else {
                let hashedPassword = this.fromPasswordToHash(pw);
                let currentUser = new User_1.default(username, hashedPassword);
                this.database
                    .insertUser(currentUser)
                    .then((user) => {
                    console.log("insert" + user);
                    resolve("signup success");
                })
                    .catch((user) => {
                    reject(false);
                });
            }
        });
    }
}
exports.default = UserService;
// module.exports = UserService;
//
// let userService = new UserService();
// let signUpSuccess = (result) => {
// 	console.log(result);
// };
// let signUpError = (error) => {
// 	console.log(error);
// };
// // userService.signUp(signUpSuccess, signUpError, "patricklai123456", "patricklai123567");
//
// let loginSuccess = (result) => {
// 	console.log(result);
// };
//
// let loginError = (error) => {
// 	console.log(error);
// };
//
// userService.login(loginSuccess, loginError, "patricklai123456", "patricklai123567");
