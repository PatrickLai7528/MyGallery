export default class Image {
  private path: string;
  private tags: string;

  constructor(path: string, tags: string) {
    this.path = path;
    this.tags = tags;
  }

  public getPath(): string {
    return this.path;
  }

  public getTags(): string {
    return this.tags;
  }
}
