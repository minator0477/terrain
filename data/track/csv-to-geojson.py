import os
import glob
import pandas as pd
import geopandas as gpd
from shapely.geometry import LineString

# 入出力ディレクトリ
csv_dir = 'csv'
geojson_dir = 'geojson'
os.makedirs(geojson_dir, exist_ok=True)

# CSVファイル取得
csv_files = glob.glob(os.path.join(csv_dir, '*.csv'))

lines = []
properties = []

for csv_file in csv_files:
    fname = os.path.splitext(os.path.basename(csv_file))[0]
    df = pd.read_csv(csv_file, parse_dates=['time'])

    # 緯度経度の組み合わせ
    coords = list(zip(df['longitude'], df['latitude']))
    if len(coords) < 2:
        continue  # 線にならない場合はスキップ

    # LineString作成
    line = LineString(coords)
    lines.append(line)

    # 時刻関連データ作成
    min_time = df['time'].min()
    max_time = df['time'].max()
    mean_time = min_time + (max_time - min_time) / 2

    properties.append({
        'filename': fname,
        'min_time': min_time.strftime('%Y-%m-%d %H:%M:%S'),
        'max_time': max_time.strftime('%Y-%m-%d %H:%M:%S'),
        'datetime': mean_time.strftime('%Y-%m-%d %H:%M:%S'),
    })

# GeoDataFrame化
gdf = gpd.GeoDataFrame(properties, geometry=lines, crs="EPSG:4326")

# GeoJSONとして保存
output_path = os.path.join(geojson_dir, 'tracks.geojson')
gdf.to_file(output_path, driver='GeoJSON')

print(f"GeoJSON出力完了: {output_path}")

