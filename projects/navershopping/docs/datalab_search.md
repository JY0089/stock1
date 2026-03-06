# 통합 검색어 트렌드 API 가이드 (데이터랩)

네이버 통합 검색어 트렌드 API는 데이터랩 서비스 내의 통합 검색어 트렌드 조회를 제공하는 비로그인 방식의 오픈 API입니다. 이 문서는 해당 API를 즉시 구현할 수 있도록 상세한 명세와 예제를 요약 없이 원본에 기반하여 작성되었습니다.

## 1. 개요
그룹으로 묶은 검색어에 대한 네이버 통합검색에서 검색 추이 데이터를 JSON 형식으로 반환합니다. 데이터랩 서비스의 검색어 트렌드 추이를 외부 애플리케이션에서 직접 조회하고 시각화하거나 분석하는 데 활용할 수 있습니다.

## 2. API 호출 기본 정보
- **요청 URL**: `https://openapi.naver.com/v1/datalab/search`
- **프로토콜**: HTTPS
- **HTTP 메서드**: POST
- **인증 방식**: 비로그인 방식 (HTTP 헤더에 클라이언트 ID, 시크릿 전송)

## 3. 사전 준비 사항
통합 검색어 트렌드 API를 호출하기 위해서는 네이버 개발자 센터에서 사전 준비가 완료되어야 합니다.
1. 애플리케이션 등록: 개발자 센터의 [Application > 애플리케이션 등록] 메뉴를 통해 새로운 앱을 등록합니다.
2. API 권한 확인: 등록 시 사용 API로 '데이터랩 (검색어트렌드)'를 선택하거나, 이후 환경설정의 API 설정 탭에서 추가해야 합니다.
3. 클라이언트 아이디 및 시크릿 확보: 등록 완료 후 발급되는 `X-Naver-Client-Id`와 `X-Naver-Client-Secret`을 API 요청 헤더에 포함해야 합니다.

## 4. 파라미터 상세
POST 메서드를 통해 Body에 요청 파라미터를 JSON 형식으로 전달해야 합니다.

### 필수 파라미터
- `startDate` (string): 조회 기간 시작 날짜. 형식은 `yyyy-mm-dd` 입니다. (예: "2017-01-01")
- `endDate` (string): 조회 기간 종료 날짜. 형식은 `yyyy-mm-dd` 입니다. (예: "2017-04-30")
- `timeUnit` (string): 구간 단위. `date`(일간), `week`(주간), `month`(월간) 중 하나를 지정합니다.
- `keywordGroups` (array): 주제어와 주제어에 해당하는 검색어 묶음의 배열입니다. 최대 5개 그룹을 지정할 수 있습니다.
  - `groupName` (string): 주제어 (예: "한글")
  - `keywords` (array): 주제어에 해당하는 검색어 배열 (예: ["한글", "korean"]). 최대 20개 검색어.

### 선택 파라미터
- `device` (string): 기기 환경. `pc` (PC에서 검색), `mo` (모바일에서 검색) 중 하나. 입력하지 않으면 모든 기기 환경을 대상으로 합니다.
- `ages` (array): 연령대. 아래 코드 값의 배열을 지정할 수 있습니다. 입력하지 않으면 모든 연령대를 대상으로 합니다.
  - `1`: 0~12세
  - `2`: 13~18세
  - `3`: 19~24세
  - `4`: 25~29세
  - `5`: 30~34세
  - `6`: 35~39세
  - `7`: 40~44세
  - `8`: 45~49세
  - `9`: 50~54세
  - `10`: 55~59세
  - `11`: 60세 이상
- `gender` (string): 성별. `m` (남성), `f` (여성) 중 하나. 입력하지 않으면 모든 성별을 대상으로 합니다.

## 5. HTTP 헤더 필수 항목
API를 요청할 때 반드시 HTTP 요청 헤더에 다음 정보들이 포함되어야 합니다.
- `Content-Type`: `application/json` (파라미터를 JSON 포맷으로 전달 시)
- `X-Naver-Client-Id`: {애플리케이션 등록 시 발급받은 클라이언트 아이디 값}
- `X-Naver-Client-Secret`: {애플리케이션 등록 시 발급받은 클라이언트 시크릿 값}

## 6. 요청 예제 (cURL)
```bash
curl https://openapi.naver.com/v1/datalab/search \
  --header "X-Naver-Client-Id: YOUR_CLIENT_ID" \
  --header "X-Naver-Client-Secret: YOUR_CLIENT_SECRET" \
  --header "Content-Type: application/json" \
  -d @<(cat <<EOF
{
  "startDate": "2017-01-01",
  "endDate": "2017-04-30",
  "timeUnit": "month",
  "keywordGroups": [
    {
      "groupName": "한글",
      "keywords": [
        "한글",
        "korean"
      ]
    },
    {
      "groupName": "영어",
      "keywords": [
        "영어",
        "english"
      ]
    }
  ],
  "device": "pc",
  "ages": [
    "1",
    "2"
  ],
  "gender": "f"
}
EOF
)
```

## 7. 응답 결과 형식
API 요청 응답에 성공(상태 코드 200)하면 결괏값을 JSON 형식으로 반환합니다. 응답의 각 데이터 노드는 비율 데이터(`ratio`)로 구성되며, 해당 기간에 가장 검색량이 높은 구간을 100으로 설정하고 나머지 기간 검색량에 대해 상대적인 값을 제공합니다.

### 반환 필드 구성
- `startDate` (string): 실제 조회된 기간의 시작 날짜 (`yyyy-mm-dd`)
- `endDate` (string): 실제 조회된 기간의 종료 날짜 (`yyyy-mm-dd`)
- `timeUnit` (string): 구간 단위
- `results` (array): 검색어 그룹별 검색 트렌드 데이터 리스트
  - `title` (string): 파라미터로 전달했던 그룹 이름
  - `keywords` (array): 파라미터로 전달했던 검색어 배열
  - `data` (array): 실제 기간별 검색 비율 데이터 배열
    - `period` (string): 구간별 시작일 지정 (`yyyy-mm-dd`)
    - `ratio` (float): 해당 구간의 검색량의 상대적 비율치

### 응답 JSON 예제
```json
{
  "startDate": "2017-01-01",
  "endDate": "2017-04-30",
  "timeUnit": "month",
  "results": [
    {
      "title": "한글",
      "keywords": [
        "한글",
        "korean"
      ],
      "data": [
        { "period": "2017-01-01", "ratio": 47.0 },
        { "period": "2017-02-01", "ratio": 53.23 },
        { "period": "2017-03-01", "ratio": 100.0 },
        { "period": "2017-04-01", "ratio": 85.32 }
      ]
    },
    {
      "title": "영어",
      "keywords": [
        "영어",
        "english"
      ],
      "data": [
        { "period": "2017-01-01", "ratio": 40.08 },
        { "period": "2017-02-01", "ratio": 36.69 },
        { "period": "2017-03-01", "ratio": 52.11 },
        { "period": "2017-04-01", "ratio": 44.45 }
      ]
    }
  ]
}
```

## 8. 일반적인 오류 내역 및 대처
- **403 오류 (API 권한 없음)**: 개발자 센터 애플리케이션 설정에서 "데이터랩 (검색어트렌드)" API 사용이 등록되지 않았을 경우 발생합니다.
- 조치 방법: 개발자 센터 대시보드에서 애플리케이션 상세로 진입 후, "API 설정" 탭에서 해당 API를 직접 수동으로 추가 후 재시도해야 합니다.
- 이 외의 일반적인 오류(400 Bad Request 등)는 잘못된 형식의 파라미터가 원인일 수 있으므로 JSON 구조와 필수 파라미터(기간 포맷, timeUnit 등)를 재검토해야 합니다.
