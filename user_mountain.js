export class UserMountainRecord {
    constructor({recordId, date, summitId, mountainName, mountainId, journeyId, remarks}){
        const [year, month, day] = date.split("/").map(Number);

        this.recordId = recordId;
        this.date = new Date(year, month-1, day); // 月は0始まり
        this.summitId = summitId;
        this.mountainId = mountainId;
        this.journeyId = journeyId;
        this.remarks = remarks;
        Object.freeze(this); // 変更不可にする
    }

    toString(){
        return `${this.recordId}, ${this.date}`;
    }
}


export class RecordList {
    // 初期化メソッド
    constructor(records = []){
        this.records = records; // Mountainインスタンス配列
    }

    filterByDate(startDate, endDate){
        const filteredRecords = this.records.filter(record => {
            const day = record.date;
            return day >= startDate && day <= endDate
        });

        return new RecordList(filteredRecords);
    }
}

export async function loadRecords(name){
    const input_file = "/" + name + "_mountain_record.json";
    const res = await fetch(input_file);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error(`${input_file} must be an array`);
    // return data.map(item => new UserMountainRecord(item));
    const records = data.map(item => new UserMountainRecord(item));
    return new RecordList(records);
}
