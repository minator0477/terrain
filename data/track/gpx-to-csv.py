import os
import glob
import pandas as pd
import gpxpy
import gpxpy.gpx
import pytz

def gpx_to_csv(gpx_file, output_folder):
    with open(gpx_file, 'r', encoding='utf-8') as f:
        gpx = gpxpy.parse(f)

    data = []

    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                data.append({
                    'latitude': point.latitude,
                    'longitude': point.longitude,
                    'elevation': point.elevation,
                    'time': point.time  # UTCで取得される
                })

    df = pd.DataFrame(data)

    # 時刻をJSTに変換
    if not df.empty and 'time' in df.columns:
        df['time'] = pd.to_datetime(df['time'], utc=True).dt.tz_convert('Asia/Tokyo')
        df['time'] = df['time'].dt.strftime('%Y-%m-%d %H:%M:%S')  # 表示形式の調整（任意）

    # 保存
    basename = os.path.basename(gpx_file).replace('.gpx', '.csv')
    output_path = os.path.join(output_folder, basename)
    df.to_csv(output_path, index=False)
    print(f"変換完了: {output_path}")

def convert_all_gpx():
    input_folder = 'gpx'
    output_folder = 'csv'
    os.makedirs(output_folder, exist_ok=True)

    gpx_files = glob.glob(os.path.join(input_folder, '*.gpx'))

    if not gpx_files:
        print("gpxフォルダにファイルがありません。")
        return

    for gpx_file in gpx_files:
        gpx_to_csv(gpx_file, output_folder)

if __name__ == '__main__':
    convert_all_gpx()

