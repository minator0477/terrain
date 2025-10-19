import { Mountain, MountainList } from "./mountain.js"; // 相対パスに注意
import { UserMountainRecord, RecordList } from "./user_mountain.js"; // 相対パスに注意


export class UserMountainCount {
    constructor(mountain, count){
         
        this.No = mountain.No;
        this.name = mountain.name;
        this.yomi = mountain.yomi;
        this.latitude = mountain.latitude;
        this.longitude = mountain.longitude;
        this.elevation = mountain.elevation;
        this.prefecture = mountain.prefecture;
        this.region = mountain.region;
        this.remarks = mountain.remarks;
        this.classname = mountain.classname;
        this.count = count;

        Object.freeze(this); // 変更不可にする
    }

    toString(){
        return `No. ${this.No}, ${this.name}`;
    }
}

export class UserMountainCountList {
    // 初期化
    constructor(meizans, records){

        // 型チェック
        if (!(meizans instanceof MountainList)){
            throw new TypeError(`${meizans}はMountainListクラスではありません。`);
        }
        if (!(records instanceof RecordList)){
            throw new TypeError(`${records}はRecordListクラスではありません。`);
        }
        // console.log(meizans.mountains.length);

        const counts = new Array(meizans.mountains.length).fill(0);
        const countedObjList = [];
         
        $.each(records.records, function(index, record) {
            counts[record.summitId - 1]++;
        });

        $.each(meizans.mountains, function(index, meizan){
            // console.log(index, meizan);
            const userMountainCount = new UserMountainCount(meizan, counts[index]);
            countedObjList.push(userMountainCount);
        });
        // console.log(countedObjList);
        this.counts = countedObjList;
        Object.freeze(this); // 変更不可にする
    }

    toString(){
        return `${this.recordId}, ${this.date}`;
    }

    // オブジェクトをGeoJSONに変換したものを返す
    convertToGeoJSON() {
        return {
            type: "FeatureCollection",
            features: this.counts.map(item => {
                const {latitude, longitude, ...props } = item;

                if (latitude === undefined || longitude === undefined) {
                    throw new Error("Each item must have 'lat' and 'lon' properties");
                }
            
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude] // GeoJSONは[経度, 緯度]
                    },
                    properties: props
                };
            })
        };
    }
}



