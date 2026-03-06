import os
import json
import csv
import urllib.request
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv

def collect_naver_hotpack_blog(client_id, client_secret, display=100, max_pages=5):
    """
    네이버 블로그 검색 API를 사용하여 '핫팩' 관련 포스트를 수집하고 CSV로 저장합니다.
    (docs/search_blog.md 기반)
    """
    query = "핫팩"
    encoded_query = urllib.parse.quote(query)
    url_base = "https://openapi.naver.com/v1/search/blog.json"
    
    all_items = []
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] '{query}' 블로그 검색 데이터 수집을 시작합니다.")
    
    for page in range(1, max_pages + 1):
        start = (page - 1) * display + 1
        url = f"{url_base}?query={encoded_query}&display={display}&start={start}&sort=sim"
        
        request = urllib.request.Request(url)
        request.add_header("X-Naver-Client-Id", client_id)
        request.add_header("X-Naver-Client-Secret", client_secret)
        
        try:
            response = urllib.request.urlopen(request)
            rescode = response.getcode()
            if rescode == 200:
                response_body = response.read()
                data = json.loads(response_body.decode('utf-8'))
                
                items = data.get('items', [])
                if not items:
                    print(" - 더 이상 수집할 블로그 데이터가 없습니다.")
                    break
                    
                all_items.extend(items)
                print(f" - {page}번째 페이지 (start={start}) 수집 완료: 현재 누적 {len(all_items)}건")
                
                if len(items) < display:
                    print(" - 반환된 데이터 개수가 요청 개수보다 적습니다. 조기 종료합니다.")
                    break
            else:
                print(f"Error Code: {rescode}")
                break
        except Exception as e:
            print(f"API 호출 중 오류 발생: {e}")
            break
            
    # 수집한 데이터를 data 디렉토리 하위에 CSV 형태로 저장
    if all_items:
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{output_dir}/hotpack_blog_results_{timestamp}.csv"
        
        try:
            with open(filename, 'w', encoding='utf-8-sig', newline='') as f:
                # 블로그 검색 API 응답 필드: title, link, description, bloggername, bloggerlink, postdate
                fieldnames = ['title', 'description', 'bloggername', 'postdate', 'link', 'bloggerlink']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                
                writer.writeheader()
                for item in all_items:
                    # 블로그 결과의 <b> </b> 태그 제거
                    title = item.get('title', '').replace('<b>', '').replace('</b>', '')
                    description = item.get('description', '').replace('<b>', '').replace('</b>', '')
                    
                    writer.writerow({
                        'title': title,
                        'description': description,
                        'bloggername': item.get('bloggername', ''),
                        'postdate': item.get('postdate', ''),
                        'link': item.get('link', ''),
                        'bloggerlink': item.get('bloggerlink', '')
                    })
                    
            print(f"\n최종 수집 완료: 총 {len(all_items)}건의 블로그 데이터가 CSV 형식으로 '{filename}'에 저장되었습니다.")
        except Exception as e:
            print(f"CSV 형식 저장 중 오류 발생: {e}")
    else:
        print("수집된 데이터가 없습니다. 애플리케이션 등록 상태(Client ID/Secret) 및 API 권한을 확인해주세요.")

if __name__ == "__main__":
    # .env 파일에서 환경변수 불러오기
    load_dotenv()
    
    NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID", "")
    NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET", "")
    
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("주의: API 요청을 위해 네이버 오픈API Client ID와 Secret을 코드 또는 환경변수에 설정해주셔야 합니다!")
    
    # 총 500건의 블로그 데이터 수집 (CSV 저장)
    collect_naver_hotpack_blog(NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, display=100, max_pages=5)
