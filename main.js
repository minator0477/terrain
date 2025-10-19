// ./main.js
// Maplibre GL JSの読み込み
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'

// OpacityControlプラグインの読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

// 地理院標高タイルをMaplibre gs jsで利用するためのモジュール
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';

import {initMap } from './initMap.js';
import { setupLegendToggle } from "./legendToggle.js"
import { addLoadedEvent } from './addLoadedEvent.js';



import { UserMountainRecord, loadRecords, RecordList } from "./user_mountain.js"; // 相対パスに注意
import { Mountain, loadMountains, MountainList } from "./mountain.js"; // 相対パスに注意
import { UserMountainCount, UserMountainCountList } from "./user_count.js"; // 相対パスに注意

const map = initMap();
addLoadedEvent(map);
console.log("aa");
// setupLegendToggle();

const name = "mineta";
/*
async function main() {
    try {
        const records = await loadRecords(name);
        console.log("Loaded records:", records);
        const meizans = await loadMountains();
        console.log("Loaded meizans:", meizans);

        const start = new Date("2019-04-01");
        const end = new Date("2025-12-31");
        const filteredRecords = records.filterByDate(start, end);

        // console.log(meizans.mountains[0]);
        // const meizanCount = new UserMountainCount(meizans.mountains[0], 3);
        // console.log(meizanCount);

        const userMountainCountList =  new UserMountainCountList(meizans, filteredRecords);
        console.log(userMountainCountList.convertToGeoJSON());

    } catch (err) {
        console.error(err);
    }
}

main();
*/
