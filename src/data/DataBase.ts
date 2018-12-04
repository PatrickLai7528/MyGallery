import * as Mysql from "mysql";
import User from "./../entity/User";
import Image from "./../entity/Image";
/**
 *
 *
 * @export
 * @class Database
 */
export default class Database {
  private connection: Mysql.Connection | null;

  /**
   *Creates an instance of Database.
   * @memberof Database
   */
  private constructor() {
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

  /**
   *
   *
   * @static
   * @returns {Promise<Database>}
   * @memberof Database
   */
  static connect(): Promise<Database> {
    return new Promise<Database>((resolve, reject) => {
      try {
        let database = new Database();
        resolve(database);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *
   *
   * @param {User} user
   * @returns {Promise<User>}
   * @memberof Database
   */
  public insertUser(user: User): Promise<User> {
    let sql = "INSERT INTO g_user(username, password) VALUES(?, ? )";
    let params = [user.getUsername(), user.getPassword()];
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Databse is not ready"));
      } else {
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

  /**
   *
   *
   * @returns {Promise<User[]>}
   * @memberof Database
   */
  public selectAllUser(): Promise<User[]> {
    let sql = "select * from g_user";
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Database is not ready"));
      } else {
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

  /**
   *
   *
   * @param {string} username
   * @returns {Promise<User[]>}
   * @memberof Database
   */
  public selectUser(username: string): Promise<User[]> {
    let sql = "select * from g_user where username = ?";
    let params = username;

    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Database is not ready"));
      } else {
        this.connection.query(sql, params, (err, result) => {
          if (err) {
            console.log("[SELECT ERROR] - ", err.message);
            reject(err);
            return;
          }
          // console.log(result[0].getUser);
          // console.log(result[0].password);
          let userList: User[] = [];
          for (let i = 0; i < result.length; i++) {
            userList.push(new User(result[i].username, result[i].password));
          }
          resolve(userList);
        });
      }
    });
  }

  public insertImage(
    username: string,
    imagePath: string,
    tags: string
  ): Promise<string> {
    let sql = "INSERT INTO g_image(username, image_path, tags) VALUES(?, ?, ?)";
    let params = [username, imagePath, tags];
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Databse is not ready"));
      } else if (!username || !imagePath) {
        reject(new Error("Argument check failed"));
      } else {
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

  public getAllImage(username: string): Promise<Image[]> {
    let sql = "select * from g_image where username = ?";
    let params = [username];
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Databse is not ready"));
      } else if (!username) {
        reject(new Error("Argument check failed"));
      } else {
        this.connection.query(sql, params, (error, result) => {
          if (error) {
            console.log("[SELECT ERROR] - ", error.message);
            reject(error);
          }
          let imageList: Image[] = [];
          for (let i = 0; i < result.length; i++) {
            imageList.push(new Image(result[i].image_path, result[i].tags));
          }
          resolve(imageList);
        });
      }
    });
  }
}
