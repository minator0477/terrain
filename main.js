// ./main.js
// Maplibre GL JSの読み込み
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'

// OpacityControlプラグインの読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

// 地理院標高タイルをMaplibre gs jsで利用するためのモジュール
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';

const map = new maplibregl.Map({
	container: 'map', //div要素のid
	zoom: 5, //初期表示のズーム
	minZoom: 5, //最小ズーム
	maxZomm: 18,
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
				'%copy: <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', 			},
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

		]
	}
});

// マップの初期ロード完了時に発火するイベントを検知する
map.on('load', () => {
	// 背景地図・重ねるタイル地図のコントロール
	const opacity = new OpacityControl({
		baseLayers: {
			'std-layer': '地理院標準地図',
			'pale-layer': '淡色地図',
			'altitude-layer': '標高図',
		}
	});
	map.addControl(opacity, 'top-left'); // 第二引数で場所を指定できる

	// 地形データ生成（地理院標高タイル）
	const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol);
	// 地形データ追加
	map.addSource('terrain', gsiTerrainSource);
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

	map.addControl(
		new maplibregl.TerrainControl({
			source: 'terrain', // type="raster-dem"のsourceのID
			exaggeration: 1.25, //標高を強調する倍率
		}),

	);
});
