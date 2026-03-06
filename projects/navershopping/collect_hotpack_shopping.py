import os
import json
import csv
import urllib.request
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv

def collect_naver_hotpack_shopping(client_id, client_secret, display=100, max_pages=5):
    """
    네이버 쇼핑 검색 API를 사용하여 '핫팩' 관련 상품 목록을 수집하고 CSV로 저장합니다.
    """
    query = "핫팩"
    encoded_query = urllib.parse.quote(query)
    # 블로그 검색(blog.json)에서 쇼핑 검색(shop.json) 엔드포인트로 변경
    url_base = "https://openapi.naver.com/v1/search/shop.json"
    
    all_items = []
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] '{query}' 네이버 쇼핑 데이터 수집을 시작합니다.")
    
    for page in range(1, max_pages + 1):
        start = (page - 1) * display + 1
        # 쇼핑 API 정렬 옵션 (sim: 정확도순 내림차순, date: 등록일순 내림차순, asc: 가격 오름차순, dsc: 가격 내림차순)
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
                    print(" - 더 이상 수집할 쇼핑 데이터가 없습니다.")
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
        filename = f"{output_dir}/hotpack_shopping_results_{timestamp}.csv"
        
        # 쇼핑 검색 API의 주요 응답 필드 추출 (title, link, image, lprice, hprice, mallName, productId, productType, brand, maker, category1~4)
        # title 필드 내의 <b> 태그 제거를 위한 간단한 처리 포함
        try:
            with open(filename, 'w', encoding='utf-8-sig', newline='') as f:
                # CSV 헤더 정의
                fieldnames = ['productId', 'title', 'lprice', 'hprice', 'mallName', 'brand', 'maker', 'category1', 'category2', 'category3', 'category4', 'link', 'image']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                
                writer.writeheader()
                for item in all_items:
                    # <b> 태그 제거
                    title = item.get('title', '').replace('<b>', '').replace('</b>', '')
                    
                    writer.writerow({
                        'productId': item.get('productId', ''),
                        'title': title,
                        'lprice': item.get('lprice', ''),
                        'hprice': item.get('hprice', ''),
                        'mallName': item.get('mallName', ''),
                        'brand': item.get('brand', ''),
                        'maker': item.get('maker', ''),
                        'category1': item.get('category1', ''),
                        'category2': item.get('category2', ''),
                        'category3': item.get('category3', ''),
                        'category4': item.get('category4', ''),
                        'link': item.get('link', ''),
                        'image': item.get('image', '')
                    })
                    
            print(f"\n최종 수집 완료: 총 {len(all_items)}건의 쇼핑 데이터가 CSV 형식으로 '{filename}'에 저장되었습니다.")
        except Exception as e:
            print(f"CSV 형식 저장 중 오류 발생: {e}")
            
    else:
        print("수집된 데이터가 없습니다. 애플리케이션 등록 상태(Client ID/Secret) 및 쇼핑 검색 API 권한을 확인해주세요.")

if __name__ == "__main__":
    # TODO: 본인의 Client ID와 Secret 값을 입력하거나 
    # .env 파일에서 환경변수 불러오기
    load_dotenv()
    
    NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID", "")
    NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET", "")
    
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("주의: API 요청을 위해 네이버 오픈API Client ID와 Secret을 코드 또는 환경변수에 설정해주셔야 합니다!")
        print("참고: 애플리케이션의 '사용 API' 설정에 '검색' 권한이 체크되어 있어야 합니다.")
    
    # 예시: 100건씩 5회 반복 호출 = 총 500건 쇼핑 상품 목록 리스트업 조회
    collect_naver_hotpack_shopping(NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, display=100, max_pages=5)
