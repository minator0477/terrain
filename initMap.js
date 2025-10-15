
// Maplibre GL JSの読み込み
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'

export function initMap() {
    const map = new maplibregl.Map({
        container: 'map', //div要素のid
        zoom: 5, //初期表示のズーム
        minZoom: 5, //最小ズーム
        maxZoom: 18,
        maxBounds : [122, 20, 154, 50],
        style: {
            version: 8,
            sources: {
                // 背景地図ソース
                osm: {
                    type: 'raster',
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    maxzoom: 19,
                    tileSize: 256,
                    attribution:
                    '%copy: <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',             },
          //淡色地図
          pale: {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
            attribution: "地図の出典：<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
            tileSize: 256,
          },
          // 地理院標準地図
          std: {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: "地図の出典：<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
          },
          // 地理院色別標高図
          altitude: {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: "地図の出典：<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
          },
          // 地理院陰影起伏図
          shade: {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: "地図の出典：<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>",
          },

            },
            layers: [
                //背景地図レイヤー
                {
                    id: 'osm-layer',
                    source: 'osm',
                    type: 'raster',
                },
                {
                    // 一意のレイヤID
                    id: 'pale-layer',
                    // レイヤの種類。background、fill、line、symbol、raster、circle、fill-extrusion、heatmap、hillshade のいずれか
                    type: 'raster',
                    // データソースの指定
                    source: 'pale',
                    layout: { visibility: 'none', },
                },
                {
                    id: 'std-layer',
                    type: 'raster',
                    source: 'std',
                    layout: { visibility: 'none', },
                },
                {
                    id: 'altitude-layer',
                    type: 'raster',
                    source: 'altitude',
                    paint: {'raster-opacity': 0.3},
                    layout: {
                      visibility: 'none',
                    },
                },
                {
                    id: 'shade-layer',
                    type: 'raster',
                    source: 'shade',
                    layout: { visibility: 'none', },
                },

            ]
        }
    });

    return map;
}
