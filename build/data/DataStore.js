"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataStore {
    static getInstance() {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }
        return DataStore.instance;
    }
    constructor() {
        this.map = new Map();
    }
    put(key, value) {
        if (typeof value === "function") {
            value = new value();
        }
        this.map.set(key, value);
        return this;
    }
    get(key) {
        return this.map.get(key);
    }
}
exports.default = DataStore;
// module.exports = DataStore;
