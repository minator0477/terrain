import { RecordList } from "./user_mountain.js"; // 相対パスに注意
import $ from "jquery";
export class Mountain {
    constructor({No, name, latitude, longitude, yomi, elevation, prefecture, region, remarks}){
        this.No = No;
        this.name = name;
        this.yomi = yomi;
        this.latitude = latitude;
        this.longitude = longitude;
        this.elevation = elevation;
        this.prefecture = prefecture;
        this.region = region;
        this.remarks = remarks;

        const result = No / 100.0
        if (result < 1.0){
            this.classname = "百名山";
        }
        if (result >= 1.0 && result < 2.0){
            this.classname = "二百名山";
        }
        if (result >= 2.0){
            this.classname = "三百名山";
        }


        Object.freeze(this); // 変更不可にする
    }

    toString(){
        return `No. ${this.No}, ${this.name}`;
    }
}


export class MountainList {
    // 初期化メソッド
    constructor(mountains = []){
        this.mountains = mountains; // Mountainインスタンス配列
    }
}


export async function loadMountains(){
    const input_file = "/meizan.json";
    const res = await fetch(input_file);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error(`${input_file} must be an array`);
    // return data.map(item => new Mountain(item));
    const mountains = data.map(item => new Mountain(item));
    return new MountainList(mountains);
}
