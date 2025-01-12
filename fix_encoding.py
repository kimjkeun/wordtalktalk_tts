import pandas as pd

# CSV 파일 읽기
df = pd.read_csv('vocabulary_test_new2.csv')

# UTF-8로 저장 (BOM 추가)
df.to_csv('vocabulary_test_new2.csv', encoding='utf-8-sig', index=False)
