import os
import pandas as pd
import matplotlib.pyplot as plt
import koreanize_matplotlib
from collections import Counter
import re

# Seaborn 스타일 사용 안 함 (사용자 규칙)
# 대신 기본 Matplotlib 스타일에 koreanize_matplotlib만 적용된 상태

def perform_eda():
    # 최신 CSV 파일 찾기
    data_dir = "data"
    csv_files = [f for f in os.listdir(data_dir) if f.startswith('hotpack_blog_results') and f.endswith('.csv')]
    if not csv_files:
        print("CSV 파일을 찾을 수 없습니다.")
        return
        
    latest_csv = max(csv_files)
    file_path = os.path.join(data_dir, latest_csv)
    print(f"[{latest_csv}] 파일 분석을 시작합니다...")
    
    # 데이터 로드
    df = pd.read_csv(file_path)
    
    # postdate를 datetime 형식으로 변환
    df['postdate'] = pd.to_datetime(df['postdate'], format='%Y%m%d', errors='coerce')
    
    # 이미지 저장 디렉토리 생성
    img_dir = "docs/images"
    os.makedirs(img_dir, exist_ok=True)
    
    # 1. 일별 포스팅 빈도 꺾은선 그래프
    daily_posts = df['postdate'].value_counts().sort_index()
    
    plt.figure(figsize=(10, 5))
    plt.plot(daily_posts.index, daily_posts.values, marker='o', color='tab:blue', linestyle='-')
    plt.title('일별 네이버 블로그 "핫팩" 관련 포스팅 수', fontsize=16)
    plt.xlabel('날짜', fontsize=12)
    plt.ylabel('포스팅 수', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    daily_post_img = os.path.join(img_dir, "eda_daily_posts.png")
    plt.savefig(daily_post_img, dpi=300)
    plt.close()
    
    # 2. 상위 블로거 (가장 글을 많이 쓴 블로거 Top 10)
    top_bloggers = df['bloggername'].value_counts().head(10)
    
    plt.figure(figsize=(10, 6))
    top_bloggers.plot(kind='barh', color='tab:orange')
    plt.title('블로그 포스팅 최다 작성자 Top 10', fontsize=16)
    plt.xlabel('포스팅 수', fontsize=12)
    plt.ylabel('블로거 이름', fontsize=12)
    plt.gca().invert_yaxis() # 1위가 가장 위에 오도록
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    top_bloggers_img = os.path.join(img_dir, "eda_top_bloggers.png")
    plt.savefig(top_bloggers_img, dpi=300)
    plt.close()
    
    # 3. 제목 키워드 빈도 분석 (간단한 형태소 분석 대체: 공백 분리 후 명사 추출 형태)
    def simple_tokenize(text):
        if pd.isna(text): return []
        # 한글, 수자, 영문자만 남기기
        clean_text = re.sub(r'[^가-힣a-zA-Z0-9\s]', ' ', text)
        words = clean_text.split()
        # 1글자 이상, 그리고 '핫팩' 제외
        return [w for w in words if len(w) > 1 and w != '핫팩']
        
    all_words = []
    for title in df['title']:
        all_words.extend(simple_tokenize(title))
        
    word_counts = Counter(all_words).most_common(15)
    words, counts = zip(*word_counts)
    
    plt.figure(figsize=(10, 6))
    plt.bar(words, counts, color='tab:green')
    plt.title('제목 내 주요 키워드 출현 빈도 (Top 15)', fontsize=16)
    plt.xlabel('키워드', fontsize=12)
    plt.ylabel('출현 빈도', fontsize=12)
    plt.xticks(rotation=45)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    keywords_img = os.path.join(img_dir, "eda_top_keywords.png")
    plt.savefig(keywords_img, dpi=300)
    plt.close()
    
    # 통계 텍스트 생성
    total_posts = len(df)
    unique_bloggers = df['bloggername'].nunique()
    start_date = df['postdate'].min().strftime('%Y-%m-%d')
    end_date = df['postdate'].max().strftime('%Y-%m-%d')
    
    # 마크다운 리포트 작성
    report_content = f"""# 네이버 블로그 검색 데이터 EDA 분석 리포트 ('핫팩')

> **데이터 파일:** `{latest_csv}`

## 1. 개요 및 데이터 기초 통계
수집된 네이버 블로그 검색 결과를 바탕으로 핫팩 관련 키워드 트렌드와 작성자 분포를 탐색적 데이터 분석(EDA)을 통해 확인합니다.

- **분석 기간:** {start_date} ~ {end_date}
- **총 수집 포스트:** {total_posts}개
- **관여한 고유 블로거 수:** {unique_bloggers}명

---

## 2. 일별 포스팅 트렌드
수집된 기간 동안 핫팩과 관련된 포스팅이 하루에 몇 건씩 작성되고 있는지 시계열로 나타냅니다.

![일별 포스팅 수](images/eda_daily_posts.png)

> **인사이트:** 특정 이벤트나 리뷰 시즌(겨울 등)에 게시물이 크게 치솟는 일자를 확인할 수 있습니다.

---

## 3. Top 10 작성자 (인플루언서 / 마케팅 활성 블로그)
핫팩 관련 게시글을 가장 활발하게 작성한 상위 10명의 블로거 목록입니다.

![상위 블로거 리스트](images/eda_top_bloggers.png)

> **인사이트:** 전문 리뷰어나 홍보 블로그 등 핫팩 아이템과 밀접하게 연관된 핵심 크리에이터들을 파악할 수 있습니다. 상위 랭커의 글 패턴을 심층 분석하면 바이럴 마케팅 전략 수립에 도움이 될 수 있습니다.

---

## 4. 제목 텍스트 주요 키워드 분석
제목에 '핫팩'과 함께 가장 많이 언급된 동시출현 키워드 Top 15를 시각화했습니다.

![주요 키워드 빈도](images/eda_top_keywords.png)

> **인사이트:** 소비자나 작가들이 핫팩(본질적 상품)과 함께 가장 중요하게 묶어서 이야기하는 속성(예: '군용', '대용량', '붙이는', '리뷰', '추천')이 무엇인지 확인할 수 있습니다.
"""

    report_path = "docs/eda_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    print(f"\n✅ EDA 리포트가 성공적으로 생성되었습니다: {report_path}")

if __name__ == "__main__":
    perform_eda()
