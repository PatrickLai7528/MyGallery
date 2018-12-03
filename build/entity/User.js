"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(username, pw) {
        this.username = username;
        this.pw = pw;
    }
    getUsername() {
        return this.username;
    }
    getPassword() {
        return this.pw;
    }
}
exports.default = User;
// module.exports = User;
