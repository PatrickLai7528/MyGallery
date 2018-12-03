/**
 *
 *
 * @export
 * @class DataStore
 */
export default class DataStore {
  private static instance: DataStore;
  private map: Map<string, any>;

  /**
   *
   *
   * @static
   * @returns {DataStore}
   * @memberof DataStore
   */
  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  /**
   *Creates an instance of DataStore.
   * @memberof DataStore
   */
  private constructor() {
    this.map = new Map();
  }

  /**
   *
   *
   * @param {string} key
   * @param {*} value
   * @returns {DataStore}
   * @memberof DataStore
   */
  public put(key: string, value: any): DataStore {
    if (typeof value === "function") {
      value = new value();
    }
    this.map.set(key, value);
    return this;
  }

  /**
   *
   *
   * @param {string} key
   * @returns {*}
   * @memberof DataStore
   */
  public get(key: string): any {
    return this.map.get(key);
  }
}
