import pandas as pd
import json
import os

csv_path = './csv/merged_meizan.csv'
geojson_path = './geojson/meizan.geojson'

# CSV読み込み
df = pd.read_csv(csv_path, encoding='utf-8')

# NaNをNoneに変換 (→nullに出力される）
df = df.where(pd.notnull(df), None)

features = []
for _, row in df.iterrows():
    try:
        lon = float(row['東経'])
        lat = float(row['北緯'])
    except ValueError:
        continue  # 緯度経度が欠損している行はスキップ

    # プロパティには緯度・経度以外を含める
    props = row.drop(labels=['北緯', '東経']).to_dict()


    # 列名を変更: '標高（m）' → '標高'
    if '標高（m）' in props:
        props['標高'] = props.pop('標高（m）')

    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": props
    }
    features.append(feature)

# GeoJSON構造全体
geojson_obj = {
    "type": "FeatureCollection",
    "features": features
}

# 出力先ディレクトリを作成
os.makedirs(os.path.dirname(geojson_path), exist_ok=True)

# GeoJSONを保存
with open(geojson_path, 'w', encoding='utf-8') as f:
    json.dump(geojson_obj, f, ensure_ascii=False, indent=2)

print(f"GeoJSON 出力完了: {geojson_path}")

