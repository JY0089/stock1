# 네이버 검색 API 가이드 (블로그 검색 중심)

네이버 검색 API 중 블로그 검색 결과를 조회하기 위한 오픈 API 사양입니다. 이 문서는 바로 API 개발 파트에 적용하고 구현할 수 있도록 원본 API 레퍼런스를 그대로, 상세하게 정리한 50줄 이상 규모의 가이드 라인입니다.

## 1. 블로그 검색 개요
검색 API는 네이버 통합 검색엔진이 보유하고 있는 검색 결과의 데이터를 HTTP 프로토콜 형태로 호출해 활용할 수 있는 서비스입니다.
이 중 블로그 검색은 입력한 특정 검색어 조건에 맞춘 네이버 블로그 게시글 결과 집합을 파싱 가능한 형태인 XML 또는 JSON 형식으로 제공받을 수 있습니다.

## 2. API 연결 스펙 요약
- **요청 형태**: XML 또는 JSON 반환에 따라 URL의 확장자를 선택합니다.
  - XML 형태 호출: `https://openapi.naver.com/v1/search/blog.xml`
  - JSON 형태 호출: `https://openapi.naver.com/v1/search/blog.json`
- **프로토콜**: HTTPS
- **HTTP 메서드**: GET
- **인증 방식**: 비로그인 방식 개방형 API. 따라서 사용자 권한을 위임받는 OAuth 과정 없이 애플리케이션 클라이언트 정보(Id/Secret)로 호출합니다.

## 3. 사전 준비 사항
1. **API 등록 확인**: 호출을 적용할 플랫폼에 대해서 권한 확보가 필요합니다. 환경설정의 API 등록 메뉴에서 '검색' 기능 권한이 선택되어 있어야 합니다. (만일 선택되어 있지 않으면 403 오류 반환)
2. **헤더 키값 준비**: `X-Naver-Client-Id` 데이터와 `X-Naver-Client-Secret` 데이터가 준비되어야 호출을 시도할 수 있습니다.

## 4. 파라미터 명세
파라미터는 GET 호출의 쿼리 스트링(Query String) 형식으로 요청 URL에 덧붙여 전송합니다. 파라미터의 한글 또는 특수 문자 등은 반드시 UTF-8 인코딩을 마친(URL 인코딩) 상태여야 합니다.

### 필수 파라미터
- `query` (string): 검색을 원하는 대상 문서의 검색어 문자열입니다. 반드시 지정되어야 하며 UTF-8 형식으로 URL에 인코딩 처리가 완료되어야 합니다.

### 선택 파라미터
- `display` (integer): 한 번에 표시할 검색 결과의 개수를 지정합니다. 기본값은 10이며, 최대 100까지 지정 가능합니다.
- `start` (integer): 검색 시작 위치를 나타내는 인덱스 번호. 기본값은 1이며, 최대 1000까지 지정 가능합니다. (다음 페이지 조회를 원할 경우 start의 값을 늘려 반복 조회합니다)
- `sort` (string): 검색 결과의 정렬 방법을 결정합니다.
  - `sim` (기본값): 시스템 기준의 유사도 순으로 결과를 정렬합니다.
  - `date`: 날짜순 즉, 가장 최근에 작성된 시간 내림차순으로 결과를 정렬합니다.

## 5. HTTP 헤더 전송 상세
요청을 보낼 때 아래의 두 헤더 정보를 누락하지 않도록 주의해야 합니다.
```http
GET /v1/search/blog.xml?query=%EB%A6%AC%EB%B7%B0&display=10&start=1&sort=sim HTTP/1.1
Host: openapi.naver.com
Accept: */*
X-Naver-Client-Id: {애플리케이션 등록 시 발급받은 클라이언트 아이디 값}
X-Naver-Client-Secret: {애플리케이션 등록 시 발급받은 클라이언트 시크릿 값}
```

## 6. 호출 예제 (cURL 기반)
리눅스 및 맥 환경에서 많이 쓰이는 cURL 기반의 검색 API 호출 예시입니다. `%EB%A6%AC%EB%B7%B0` 는 "리뷰" 라는 단어가 URL 코딩된 값입니다.
```bash
curl "https://openapi.naver.com/v1/search/blog.xml?query=%EB%A6%AC%EB%B7%B0&display=10&start=1&sort=sim" \
  -H "X-Naver-Client-Id: YOUR_CLIENT_ID" \
  -H "X-Naver-Client-Secret: YOUR_CLIENT_SECRET" \
  -v
```

## 7. 응답 결과 형식의 이해
출력 대상의 확장자가 `.xml`인지 `.json`인지에 따라서 응답 포맷이 달라집니다. JSON 기준으로 아래와 같은 주요 필드들을 반환받습니다.

### 전체 메타 데이터
- `lastBuildDate` (datetime): 검색 결과를 생성한 시간.
- `total` (integer): 해당 검색 조건과 매칭되는 문서들의 전체 총괄 개수.
- `start` (integer): 이번에 검색된 결과들의 첫 번째 시작 번호.
- `display` (integer): 한 번에 제공된 뷰 출력 개수.

### 개별 아이템 데이터 (items 필드 내부 배열 요소)
- `title` (string): 추출된 각 블로그 포스트 문서의 제목 정보. 검색어와 일치하는 부분은 `<b>` 태그로 감싸져 있습니다.
- `link` (string): 해당 블로그 포스트에 실제로 접근 가능한 하이퍼링크 주소.
- `description` (string): 블로그 포스트 요약문의 일부 정보. 검색어 매칭 포인트는 `<b>` 태그가 반영되어 하이라이트 처리가 가능합니다.
- `bloggername` (string): 블로그 포스트의 작성자명 즉, 블로거의 정보 텍스트입니다.
- `bloggerlink` (string): 블로거의 홈 주소입니다.
- `postdate` (string): 블로그 포스트 원문이 작성된 날짜 정보. 기본적으로 `yyyyMMdd` 형식으로 반환됩니다.

### 응답 XML 예제
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Naver Open API - blog ::'리뷰'</title>
    <link>http://search.naver.com</link>
    <description>Naver Search Result</description>
    <lastBuildDate>Mon, 26 Sep 2016 10:39:37 +0900</lastBuildDate>
    <total>8714891</total>
    <start>1</start>
    <display>10</display>
    <item>
      <title>명예훼손 없이 <b>리뷰</b>쓰기</title>
      <link>http://openapi.naver.com/l?AAABWLyw...</link>
      <description>명예훼손 없이 <b>리뷰</b>쓰기 우리 블로그하시는 분들께는 꽤 중요한 내용일 수도 있습니다... </description>
      <bloggername>건짱의 Best Drawing World2</bloggername>
      <bloggerlink>http://blog.naver.com/yoonbitgaram</bloggerlink>
      <postdate>20161208</postdate>
    </item>
  </channel>
</rss>
```

## 8. 참고사항 및 오류 대처
- 블로그 API 호출 시 `sim` (유사도)을 기본 옵션으로 하지만 최신 글이 필요하다면 반드시 `sort=date`를 명시하는 것이 중요합니다.
- 흔하게 일어나는 403 오류의 경우 `appconf.md`에서 셋업된 API에 **검색** 기능이 매칭되어 있지 않을 확률이 매우 큽니다. 권한을 추가 설정하시면 정상화됩니다.
