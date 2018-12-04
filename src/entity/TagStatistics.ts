export default class TagStatistics {
  private map: Map<string, number>;
  public constructor() {
    this.map = new Map();
  }

  public add(tag: string): void {
    let temp: number | undefined = this.map.get(tag);
    if (temp) {
      this.map.set(tag, temp + 1);
    } else {
      this.map.set(tag, 1);
    }
  }

  public getStatistics(): Map<string, number> {
//     let retObj: any[] = [];
//     for (let entry of this.map) {
//       let temp = {};
//       temp[entry] = this.map.get(entry.values);
//       retObj.push(temp);
//     }
//     console.log(retObj);
//     return retObj;
      return this.map;
}
}
