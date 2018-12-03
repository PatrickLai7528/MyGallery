
/**
 * @export
 * @class User
 */
export default class User {
  private username: string;
  private pw: string;

  /**
   *Creates an instance of User.
   * @param {string} username
   * @param {string} pw
   * @memberof User
   */
  public constructor(username: string, pw: string) {
    this.username = username;
    this.pw = pw; 
  }

  /**
   *
   *
   * @returns {string}
   * @memberof User
   */
  public getUsername(): string {
    return this.username;
  }

  /**
   *
   *
   * @returns {string}
   * @memberof User
   */
  public getPassword(): string {
    return this.pw;
  }
}
