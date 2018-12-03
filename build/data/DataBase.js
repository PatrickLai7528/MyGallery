"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// let mysql = require("mysql");
const Mysql = require("mysql");
const User_1 = require("./../entity/User");
// let User = require("./../entity/User.js");
// import User from './../entity/User.js';
class Database {
    constructor() {
        this.connection = null;
        this.connection = Mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "admin",
            database: "gallery"
        });
        this.connection.connect(err => {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log("connect success");
        });
    }
    static connect() {
        return new Promise((resolve, reject) => {
            try {
                resolve(new Database());
            }
            catch (error) {
                reject(error);
            }
        });
    }
    insertUser(user) {
        let sql = "INSERT INTO g_user(username, password) VALUES(?, ? )";
        let params = [user.getUsername(), user.getPassword()];
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject(new Error("Databse is not ready"));
            }
            else {
                this.connection.query(sql, params, (error, result) => {
                    if (error) {
                        console.log("[SELECT ERROR] - ", error.message);
                        reject(error);
                    }
                    // onSuccess(result);
                    resolve(result);
                });
            }
        });
    }
    selectAllUser() {
        let sql = "select * from g_user";
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject(new Error("Database is not ready"));
            }
            else {
                this.connection.query(sql, (error, result) => {
                    if (error) {
                        console.log("[SELECT ERROR] - ", error.message);
                        reject(error);
                        return;
                    }
                    resolve(result);
                });
            }
        });
    }
    selectUser(username) {
        let sql = "select * from g_user where username = ?";
        let params = username;
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject(new Error("Database is not ready"));
            }
            else {
                this.connection.query(sql, params, (err, result) => {
                    if (err) {
                        console.log("[SELECT ERROR] - ", err.message);
                        reject(err);
                        return;
                    }
                    // console.log(result[0].getUser);
                    // console.log(result[0].password);
                    let userList = [];
                    for (let i = 0; i < result.length; i++) {
                        userList.push(new User_1.default(result[i].username, result[i].password));
                    }
                    resolve(userList);
                });
            }
        });
    }
}
exports.default = Database;
// module.exports = DataBase;
// let databse = DataBase.connect();
// console.log(databse);
