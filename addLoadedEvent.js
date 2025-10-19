import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'

// OpacityControlプラグインの読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

// 地理院標高タイルをMaplibre gs jsで利用するためのモジュール
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';

import { UserMountainRecord, loadRecords, RecordList } from "./user_mountain.js"; // 相対パスに注意
import { Mountain, loadMountains, MountainList } from "./mountain.js"; // 相対パスに注意
import { UserMountainCount, UserMountainCountList } from "./user_count.js"; // 相対パスに注意

function removeSourceIfExists(map, sourceId) {
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }
}


function removeLayerIfExists(map, layerId) {
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
 }


// マップの初期ロード完了時に発火するイベントを検知する
async function addMeizan(map) {
    // ソース・レイヤーの有無をチェックし、既にあるものを削除
    removeSourceIfExists(map, 'meizan');
    removeLayerIfExists(map, 'meizan-class-layer');
    removeLayerIfExists(map, 'meizan-elevation-layer');
    removeLayerIfExists(map, 'meizan-count-layer');

    // ソース・レイヤー追加
    const geojson = await makeMountainList();
    // console.log(geojson);
    // ◯百名山ソース追加
    map.addSource('meizan', {
        type: 'geojson',
        // data: '/data/meizan/geojson/meizan.geojson'
        data: geojson
    });

    // ○百名山クラス追加（種別）
    map.addLayer({
        id: 'meizan-class-layer',
        type: 'circle',
        source: 'meizan',
        paint: {
            'circle-radius': 5,
            'circle-color': [
                'case',
                ['==', ['get', 'classname'], '百名山'], 'red',
                ['==', ['get', 'classname'], '二百名山'], 'blue',
                ['==', ['get', 'classname'], '三百名山'], 'green',
                'gray'
            ],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 1.0
        },
        layout: { visibility: 'none', },
    });

    // ○百名山（標高）レイヤー追加
    map.addLayer({
        id: 'meizan-elevation-layer',
        type: 'circle',
        source: 'meizan', // 事前にaddSourceしていると仮定
        paint: {
            'circle-radius': 5.0,
            'circle-stroke-width': 1,
            'circle-color': [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'elevation'], 0],  // ← 文字列から数値へ変換、失敗時は 0
                0, 'gray',       // 0m 以下：青緑
                500,  '#2c7fb8',     // 500m：水色
                1000, '#41ab5d',    // 1000m：青
                1500, '#fdae61',    // 1500m：紫
                2000, '#f46d43',    // 2000m：赤紫
                3000, '#d73027'     // 3000m以上：赤
            ],
        },
        layout: { visibility: 'none', },
    });

    // ○百名山カウントレイヤー追加
    map.addLayer({
        id: 'meizan-count-layer',
        type: 'circle',
        source: 'meizan', // 事前にaddSourceしていると仮定
        paint: {
            'circle-radius': 6.0,
            'circle-stroke-color': 'white',
            'circle-stroke-width': [
                'step',
                ['zoom'],
                1.0,   // ズームレベル 0〜10 の stroke-width
                6, 1.5,   // ズーム 10以上で1.0
                10, 3.0,   // ズーム 13以上で1.5
            ],
            // 'circle-stroke-width': 1.5,
            'circle-opacity': 1.0, 
            'circle-color': [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'count'], 0],  // ← 文字列から数値へ変換、失敗時は 0
                0,    'gray',       //      # < 1
                1,    '#6baed6',    // 1 <= # < 2
                2,    '#2171b5',    // 2 <= # < 3
                3,    '#bbdf26',    // 3 <= # < 4
                5,    '#fdae61',    // 4 <= # < 5
                1000, '#f03b20',    // 5 <= # < 1000
            ],
        },
    });
}



function addTrackSource(map) {
    // trackソース追加
    map.addSource('track', {
        type: 'geojson',
        data: '/tracks.geojson'
    });
}

function addTrackLayer(map) {
    // ラインレイヤー追加
    map.addLayer({
        id: 'track-layer',
        type: 'line',
        source: 'track',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff0000',
          'line-width':2, 
        }
    });
}


function addControlBaselayer(map){
    // 背景地図・重ねるタイル地図のコントロール
    const opacityBaseLayer = new OpacityControl({
        baseLayers: {
            'std-layer': '地理院標準地図',
            'pale-layer': '淡色地図',
            'altitude-layer': '標高図',
            'shade-layer': '陰影起伏図',
        }
    });
    map.addControl(opacityBaseLayer, 'top-left'); // 第二引数で場所を指定できる
}


function addControlMeizanlayer(map){
    const opacityMeizan = new OpacityControl({
        baseLayers: {
            'meizan-class-layer': '山頂（種別）',
            'meizan-elevation-layer': '山頂（標高）',
            'meizan-count-layer': '山頂（カウント）',
            // 'track-layer': 'トラック',
        },
        showCheckbox: false,  // ← チェックボックスではなくラジオボタン風に
    });
    map.addControl(opacityMeizan, 'top-left');
}


function addTerrainSource(map){
    // 地形データ生成（地理院標高タイル）
    const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol);
    // 地形データ追加
    map.addSource('terrain', gsiTerrainSource);
}


function addTerrainLayer(map){
    // gsiTerrainSourceはtype="raster-dem"のsourceが定義されたオブジェクト
    // 陰影図追加
    map.addLayer(
        {
            id: 'hillshade',
            source: 'terrain',
            type: 'hillshade',
            paint: {
                'hillshade-illumination-anchor': 'map', // 陰影の方向の基準
                'hillshade-exaggeration': 0.2, // 陰影の強さ
            },
        },
        //'hazard_jisuberi-layer', //どのレイヤーの手前に追加するかIDで指定
    );
}


function addClickEvent(map){
    // 地図上をクリックした際のイベント
    map.on('click', (e) => {
            const buffer = 10;
            const bbox = [
                    [e.point.x - buffer, e.point.y - buffer],
                    [e.point.x + buffer, e.point.y + buffer],
            ];
            // クリック箇所に指定緊急避難場所レイヤーが存在するかどうかをチェック
            const features = map.queryRenderedFeatures(bbox, {

                    layers: [
                            'meizan-class-layer',
                            'meizan-elevation-layer',
                            'meizan-count-layer',
                            'track-layer',
                    ],
            });
            if (features.length === 0) return; // 地物がなければ処理を終了

            // 地物があればポップアップを表示する
            const feature = features[0]; // 複数の地物が見つかっている場合は最初の要素を用いる

            // ポップアップの表示位置を決定
            let lngLat;
            const geom = feature.geometry;

            if (geom.type === 'Point') {
                    lngLat = geom.coordinates;
            } else if (geom.type === 'LineString') {
                    const coords = geom.coordinates;
                    const midIndex = Math.floor(coords.length / 2);
                    lngLat = coords[midIndex]; // 中央の点を使う
            } else if (geom.type === 'Polygon') {
                    const coords = geom.coordinates[0]; // 外周リング
                    const midIndex = Math.floor(coords.length / 2);
                    lngLat = coords[midIndex];
            } else {
                     console.warn('対応していないジオメトリタイプ:', geom.type);
                     return;
            }

            // ポップアップ表示（ここではnameプロパティを表示する例）
            const layerId = feature.layer.id;
            let html_str = null;
            if (layerId != 'track-layer'){
                    html_str = `
                            <div>山名： <strong>${feature.properties.name}</strong> </div>
                            <div>標高： <strong>${feature.properties.elevation}</strong>[m] </div>
                            <div>種別： <strong>${feature.properties.classname}</strong> </div>
                            <div>カウント： <strong>${feature.properties.count}</strong> </div>
                    `;
            }else{
                    html_str = `
                            <div>計画名： <strong>${feature.properties.filename}</strong> </div>
                            <div>日時： <strong>${feature.properties.min_time} ~ ${feature.properties.max_time}</strong> </div>
                            <div>標高： <strong>${feature.properties.min_elevation} ~ ${feature.properties.max_elevation}</strong>[m] </div>
                    `;
            }
            new maplibregl.Popup()
                    .setLngLat(lngLat)
                    .setHTML(html_str)
                    .addTo(map);
    });
}


function switchLayer(map) {
  // select要素を取得
  const select = document.getElementById("information");

  // 選択が変わったときの処理
  select.addEventListener("change", () => {
    const layers = ["classname", "elevation", "count"];
    const layerDict = {"classname": "meizan-class-layer", "elevation": "meizan-elevation-layer", "count": "meizan-count-layer" };

    const selectedValue = select.value;       // value属性の値
    const selectedLayer = select.value;       // value属性の値
    const selectedText = select.options[select.selectedIndex].text; // 表示テキスト

    layers.forEach((layer, index) => {
        map.setLayoutProperty(layerDict[layer], "visibility", "none");
        // console.log(layer, layerDict[layer]);
    });

    map.setLayoutProperty(layerDict[selectedLayer], "visibility", "visible");
    // console.log("選択された値:", selectedValue);
    // console.log("表示テキスト:", selectedText);
  });

/*
    // すべてのレイヤーを出力
    const layers = map.getStyle().layers;
    layers.forEach(layer => {
      console.log(layer.id);
    });
*/

}

  // 3️⃣ レイヤー情報を定義
      const meizanLayers = [
        { value: "meizan-count-layer", label: "登頂回数" },
        { value: "meizan-class-layer", label: "百/二百/三百名山" },
        { value: "meizan-elevation-layer", label: "標高" },
      ];
      const basemapLayers = [
        { value: "std-layer", label: "地理院標準地図" },
        { value: "pale-layer", label: "淡色図" },
        { value: "altitude-layer", label: "標高図" },
        { value: "shade-layer", label: "陰影起伏図" }
      ];

  // 2️⃣ 自作コントロール（ラジオボタン版）
  class MeizanLayerControl {
    static _legendId = "legend-section";
    constructor(layers, instanceId) {
      this._container = null;
      this._layers = layers; // { value: layerId, label: 表示テキスト }
      this._instanceId = instanceId || Math.random().toString(36).substr(2, 9) //ユニークID生成
    }

    onAdd(map) {
      this._map = map;

      this._container = document.createElement("div");
      this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";
      this._container.style.background = "rgba(230, 230, 230, 0.9)";
      // this._container.style.padding = "5px";
      this._container.style.margin = "5px";

      // ラジオボタン作成
      this._layers.forEach((item, index) => {
        const label = document.createElement("label");
        label.style.display = "block";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "layer-select-" + this._instanceId; // nameにユニークIDを付与して独立させる
        radio.value = item.value;

        // デフォルトで1つ目を選択
        if (index === 0) radio.checked = true; //インデックスで判定するように変更

        radio.addEventListener("change", () => {
          this._layers.forEach(l => {
            const layerId = l.value;
            if (map.getLayer(layerId)) {
              map.setLayoutProperty(layerId, "visibility", "none");
            }
          });
          // 選択されたレイヤーだけ visible
          if (map.getLayer(radio.value)) {
            map.setLayoutProperty(radio.value, "visibility", "visible");
            this._setLegend(radio.value);
          }
        });


        label.appendChild(radio);
        label.appendChild(document.createTextNode(" " + item.label));
        this._container.appendChild(label);
      });

    

      return this._container;
    }

    notShow() {
        this._container.style.display = "none"; // 非表示にする
    }


    _getLegend(layerName) {
        if (layerName === "meizan-class-layer") {
            return `
                <div class="legend-header"><strong>分類</strong></div>
                <div class="legend-body">
                    <span style="color:red;">●</span> 百名山<br>
                    <span style="color:blue;">●</span> 二百名山<br>
                    <span style="color:green;">●</span> 三百名山<br>
                </div>
                `
        }
        if (layerName === "meizan-elevation-layer") {
            return `
                <div class="legend-header"><strong>標高</strong></div>
                <div class="legend-body">
                    <span style="color:gray;">●</span> 0m<br>
                    <span style="color:#2c7fb8;">●</span> 500m<br>
                    <span style="color:#41ab5d;">●</span> 1000m<br>
                    <span style="color:#fdae61;">●</span> 1500m<br>
                    <span style="color:#f46d43;">●</span> 2000m<br>
                    <span style="color:#d73027;">●</span> 3000m以上
                </div>

            `
        }
        if (layerName === "meizan-count-layer") {
            return `
                <div class="legend-header"><strong>登頂回数</strong></div>
                <div class="legend-body">
                    <span style="color:gray;">●</span> 0<br>
                    <span style="color:#6baed6;">●</span> 1<br>
                    <span style="color:#2171b5;">●</span> 2<br>
                    <span style="color:#bbdf26;">●</span> 3<br>
                    <span style="color:#fdae61;">●</span> 4<br>
                    <span style="color:#f03b20;">●</span> 5以上
                </div>
            `
        }
    }

    _setLegend(layerName, elementId) {
            const container = document.getElementById(MeizanLayerControl._legendId);
            const legendHTML = this._getLegend(layerName);
            container.innerHTML = legendHTML;
    }
  }


  class BasemapLayerControl {
    constructor(layers, instanceId) {
      this._container = null;
      this._layers = layers; // { value: layerId, label: 表示テキスト }
      this._instanceId = instanceId || Math.random().toString(36).substr(2, 9) //ユニークID生成
    }

    onAdd(map) {
      this._map = map;

      this._container = document.createElement("div");
      this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";
      this._container.style.background = "rgba(230, 230, 230, 0.9)";
      // this._container.style.padding = "5px";
      this._container.style.margin = "5px";

      // ラジオボタン作成
      this._layers.forEach((item, index) => {
        const label = document.createElement("label");
        label.style.display = "block";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "layer-select-" + this._instanceId; // nameにユニークIDを付与して独立させる
        radio.value = item.value;

        // デフォルトで1つ目を選択
        if (index === 0) radio.checked = true; //インデックスで判定するように変更

        radio.addEventListener("change", () => {
          this._layers.forEach(l => {
            const layerId = l.value;
            if (map.getLayer(layerId)) {
              map.setLayoutProperty(layerId, "visibility", "none");
            }
          });
          // 選択されたレイヤーだけ visible
          if (map.getLayer(radio.value)) {
            map.setLayoutProperty(radio.value, "visibility", "visible");
          }
        });


        label.appendChild(radio);
        label.appendChild(document.createTextNode(" " + item.label));
        this._container.appendChild(label);
      });

    

      return this._container;
    }

    notShow() {
        this._container.style.display = "none"; // 非表示にする
    }

  }


async function makeMountainList() {
    const name = "mineta";
    try {
        const records = await loadRecords(name);
        // console.log("Loaded records:", records);
        const meizans = await loadMountains();
        // console.log("Loaded meizans:", meizans);

        const start = new Date("2019-04-01");
        const end = new Date("2025-12-31");
        const filteredRecords = records.filterByDate(start, end);

        // console.log(meizans.mountains[0]);
        // const meizanCount = new UserMountainCount(meizans.mountains[0], 3);
        // console.log(meizanCount);

        const userMountainCountList =  new UserMountainCountList(meizans, filteredRecords);
        
        return userMountainCountList.convertToGeoJSON();

    } catch (err) {
        console.error(err);
    }
}



export function addLoadedEvent(map) {

    map.on('load', () => {
        addMeizan(map);
        addTrackSource(map);
        addTrackLayer(map);
        addTerrainSource(map);
        addTerrainLayer(map);
        addClickEvent(map);


    // 4️⃣ 地図ロード後にコントロールを任意のdivに追加
    const layerControlBasemap = new BasemapLayerControl(basemapLayers);
    const containerBasemap = document.getElementById("basemap-control-container");
    containerBasemap.appendChild(layerControlBasemap.onAdd(map));

    const layerControlMeizan = new MeizanLayerControl(meizanLayers);
    const containerMeizan = document.getElementById("meizan-control-container");
    containerMeizan.appendChild(layerControlMeizan.onAdd(map));
    // console.log(layerControlMeizan.setLegend("meizan-elevation-layer", "legend-section"));

        // 3D表示の切り替え
        map.addControl(
            new maplibregl.TerrainControl({
                source: 'terrain', // type="raster-dem"のsourceのID
                exaggeration: 1.5, //標高を強調する倍率
            }),
        );

        // 右上のコントロールパネルの追加
        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        // 右下のスケールの追加
        map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

    });
}

