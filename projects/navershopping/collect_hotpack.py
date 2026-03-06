import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

def collect_naver_hotpack_blogs(client_id, client_secret, display=100, max_pages=5):
    """
    네이버 블로그 검색 API를 사용하여 '핫팩' 관련 포스트를 수집합니다.
    (이전에 정리한 docs/search_blog.md 스펙 기준)
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
                    print(" - 더 이상 수집할 데이터가 없습니다.")
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
            
    # 수집한 데이터를 data 디렉토리 하위에 JSON 형태로 저장
    if all_items:
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{output_dir}/hotpack_blog_results_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(all_items, f, ensure_ascii=False, indent=4)
        print(f"\n최종 수집 완료: 총 {len(all_items)}건의 데이터가 '{filename}'에 저장되었습니다.")
    else:
        print("수집된 데이터가 없습니다. 애플리케이션 등록 상태(Client ID/Secret)를 확인해주세요.")

if __name__ == "__main__":
    # TODO: 본인의 Client ID와 Secret 값을 입력하거나 
    # 개발 환경의 OS 환경변수로 등록한 뒤 실행하세요.
    NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID", "YOUR_CLIENT_ID_HERE")
    NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET", "YOUR_CLIENT_SECRET_HERE")
    
    if NAVER_CLIENT_ID == "YOUR_CLIENT_ID_HERE":
        print("주의: API 요청을 위해 네이버 오픈API Client ID와 Secret을 코드 또는 환경변수에 설정해주셔야 합니다!")
    
    # 예시: 100건씩 5회 반복 호출 = 총 500건 조회
    collect_naver_hotpack_blogs(NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, display=100, max_pages=5)
