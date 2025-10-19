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

console.log("aa");
const map = initMap();
addLoadedEvent(map);
// setupLegendToggle();

