import * as crypto from "crypto";
import Database from "../data/DataBase";
import DataStore from "../data/DataStore";
import User from "../entity/User";

/**
 *
 *
 * @export
 * @class UserService
 */
export default class UserService {
  private database: Database | null;

  /**
   *Creates an instance of UserService.
   * @memberof UserService
   */
  public constructor() {
    this.database = null;
    let database = DataStore.getInstance().get("database");
    if (database) {
      this.database = database;
    } else {
      this.getDatabase();
    }
  }

  /**
   *
   *
   * @private
   * @memberof UserService
   */
  private getDatabase() {
    Database.connect().then(database => {
      this.database = database;
      DataStore.getInstance().put("database", this.database);
    });
  }

  /**
   * @private
   * @param {string} pw
   * @returns {string}
   * @memberof UserService
   */
  private fromPasswordToHash(pw: string): string {
    const hash = crypto.createHash("md5");
    hash.update(pw);
    let ret = hash.digest("hex");
    return ret;
  }

  /**
   *
   *
   * @param {string} username
   * @param {string} pw
   * @returns {Promise<string>}
   * @memberof UserService
   */
  public login(username: string, pw: string): Promise<string> {
    const hashedPassword = this.fromPasswordToHash(pw);
    return new Promise<string>((resolve, reject) => {
      if (!this.database) {
        reject(false);
      } else {
        this.database.selectUser(username).then((userList: User[]) => {
          let isSuccess = false;
          // console.log(userList);
          for (let i = 0; i < userList.length; i++) {
            let account = userList[i];
            if (hashedPassword === account.getPassword()) {
              isSuccess = true;
              break;
            }
          }
          if (isSuccess) {
            resolve("login success");
          } else {
            reject(false);
          }
        });
      }
    });
  }

  /**
   *
   * @param {string} username
   * @param {string} pw
   * @returns {Promise<string>}
   * @memberof UserService
   */
  public signUp(username: string, pw: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.database) {
        reject(false);
      } else {
        let hashedPassword = this.fromPasswordToHash(pw);
        let currentUser = new User(username, hashedPassword);
        this.database
          .insertUser(currentUser)
          .then((user: User) => {
            console.log("insert" + user);
            resolve("signup success");
          })
          .catch((user: User) => {
            reject(false);
          });
      }
    });
  }
}
