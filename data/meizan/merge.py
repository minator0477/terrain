import pandas as pd

idir = 'csv'
odir = 'csv'
# CSVファイルを読み込んで 'クラス' と 'カウント' を追加
def load_with_class(filename, class_name):
    df = pd.read_csv(filename, encoding='utf-8')
    df['クラス'] = class_name
    df['カウント'] = 0
    return df

# 各CSVを読み込む
df100 = load_with_class(f'{idir}/100meizan02.csv', '百名山')
df200 = load_with_class(f'{idir}/200meizan02.csv', '二百名山')
df300 = load_with_class(f'{idir}/300meizan02.csv', '三百名山')

# 結合（重複なし）
df_all = pd.concat([df100, df200, df300], ignore_index=True)

# 出力
df_all.to_csv(f'{odir}/merged_meizan.csv', index=False, encoding='utf-8')
print("統合完了：merged_meizan.csv を出力しました。")

