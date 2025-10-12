import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'

// OpacityControlプラグインの読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

// 地理院標高タイルをMaplibre gs jsで利用するためのモジュール
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';

// マップの初期ロード完了時に発火するイベントを検知する
function addMeizanSource(map) {
    // ◯百名山ソース追加
    map.addSource('meizan', {
        type: 'geojson',
        data: '/data/meizan/geojson/meizan.geojson'
    });
}


function addMeizanLayer(map) {
    // ○百名山クラス追加（種別）
    map.addLayer({
        id: 'meizan-class-layer',
        type: 'circle',
        source: 'meizan',
        paint: {
            'circle-radius': 5,
            'circle-color': [
                'case',
                ['==', ['get', 'クラス'], '百名山'], 'red',
                ['==', ['get', 'クラス'], '二百名山'], 'blue',
                ['==', ['get', 'クラス'], '三百名山'], 'green',
                'gray'
            ],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 1.0
        },
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
                ['to-number', ['get', '標高'], 0],  // ← 文字列から数値へ変換、失敗時は 0
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
                ['to-number', ['get', 'カウント'], 0],  // ← 文字列から数値へ変換、失敗時は 0
                0,    'gray',       //      # < 1
                1,    '#6baed6',    // 1 <= # < 2
                2,    '#2171b5',    // 2 <= # < 3
                3,    '#bbdf26',    // 3 <= # < 4
                5,    '#fdae61',    // 4 <= # < 5
                1000, '#f03b20',    // 5 <= # < 1000
            ],
        },
        layout: { visibility: 'none', },
    });
}       


function addTrackSource(map) {
    // trackソース追加
    map.addSource('track', {
        type: 'geojson',
        data: '/data/track/geojson/tracks.geojson'
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
                            <div>山名： <strong>${feature.properties.山名}</strong> </div>
                            <div>標高： <strong>${feature.properties.標高}</strong>[m] </div>
                            <div>種別： <strong>${feature.properties.クラス}</strong> </div>
                            <div>カウント： <strong>${feature.properties.カウント}</strong> </div>
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


export function addLoadedEvent(map) {
    // マップの初期ロード完了時に発火するイベントを検知する
    map.on('load', () => {
        addMeizanSource(map);
        addMeizanLayer(map);
        addTrackSource(map);
        addTrackLayer(map);
        addControlBaselayer(map);
        addControlMeizanlayer(map);
        addTerrainSource(map);
        addTerrainLayer(map);
        addClickEvent(map);

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

