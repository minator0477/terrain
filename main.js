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

	// ◯百名山ソース追加
	map.addSource('meizan', {
    type: 'geojson',
    data: './data/meizan/geojson/meizan.geojson'
  });

	// ○百名山クラス追加（種別）
  map.addLayer({
    id: 'meizan-class-layer',
    type: 'circle',
    source: 'meizan',
		paint: {
			'circle-radius': 5,
			'circle-color': 'gray',
			'circle-stroke-color': [
				'case',
				['==', ['get', 'クラス'], '百名山'], 'red',
				['==', ['get', 'クラス'], '二百名山'], 'blue',
				['==', ['get', 'クラス'], '三百名山'], 'green',
				'gray'
			],
			'circle-stroke-width': 2  
		},
  });

	// ○百名山（標高）レイヤー追加
  map.addLayer({
		id: 'meizan-elevation-layer',
		type: 'circle',
		source: 'meizan', // 事前にaddSourceしていると仮定
		paint: {
			'circle-radius': 6.0,
			'circle-stroke-color': 'black',
			'circle-stroke-width': 2,
			'circle-color': [
				'interpolate',
				['linear'],
				['to-number', ['get', '標高（m）'], 0],  // ← 文字列から数値へ変換、失敗時は 0
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
			'circle-stroke-color': 'black',
			'circle-stroke-width': 2,
			'circle-color': [
				'interpolate',
				['linear'],
				['to-number', ['get', 'カウント'], 0],  // ← 文字列から数値へ変換、失敗時は 0
				0, 'gray',       // 0m 以下：青緑
				1, '#669EC4',    // 1000m：青
				2, '#8B88B6',    // 1500m：紫
				4, '#FF0000'     // 3000m以上：赤
			],
		},
		layout: { visibility: 'none', },
  });


	// trackソース追加
	map.addSource('track', {
    type: 'geojson',
    data: './data/track/geojson/tracks.geojson'
  });

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

	// 背景地図・重ねるタイル地図のコントロール
	const opacityBaseLayer = new OpacityControl({
		baseLayers: {
			'std-layer': '地理院標準地図',
			'pale-layer': '淡色地図',
			'altitude-layer': '標高図',
			/*
			'meizan-class-layer': '山頂（種別）',
			'meizan-elevation-layer': '山頂（標高）',
			'meizan-count-layer': '山頂（カウント）',
			*/
		}
	});
	map.addControl(opacityBaseLayer, 'top-left'); // 第二引数で場所を指定できる

	const opacityMeizan = new OpacityControl({
		baseLayers: {
			'meizan-class-layer': '山頂（種別）',
			'meizan-elevation-layer': '山頂（標高）',
			'meizan-count-layer': '山頂（カウント）',
			'track-layer': 'トラック',
		},
		showCheckbox: false,  // ← チェックボックスではなくラジオボタン風に
	});
	map.addControl(opacityMeizan, 'top-left');

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
			exaggeration: 1.5, //標高を強調する倍率
		}),
	);

	map.addControl(new maplibregl.NavigationControl(), 'top-right');

	map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');




});
