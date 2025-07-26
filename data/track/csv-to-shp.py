import os
import glob
import pandas as pd
import geopandas as gpd
from shapely.geometry import LineString

csv_dir = 'csv'
shp_dir = 'shp'

os.makedirs(shp_dir, exist_ok=True)

csv_files = glob.glob(os.path.join(csv_dir, '*.csv'))

lines = []
properties = []

for csv_file in csv_files:
    fname = os.path.splitext(os.path.basename(csv_file))[0]
    df = pd.read_csv(csv_file, parse_dates=['time'])
    coords = list(zip(df['longitude'], df['latitude']))
    line = LineString(coords)
    lines.append(line)
    
    min_time = df['time'].min()
    max_time = df['time'].max()
    mean_time = min_time + (max_time - min_time) / 2
    
    properties.append({
        'filename': fname,
        'min_time': min_time.strftime('%Y-%m-%d %H:%M:%S'),
        'max_time': max_time.strftime('%Y-%m-%d %H:%M:%S'),
        'datetime': mean_time.strftime('%Y-%m-%d %H:%M:%S'),
    })

gdf = gpd.GeoDataFrame(properties, geometry=lines, crs="EPSG:4326")

output_path = os.path.join(shp_dir, 'tracks.shp')
gdf.to_file(output_path)

print(f"出力完了: {output_path}")

