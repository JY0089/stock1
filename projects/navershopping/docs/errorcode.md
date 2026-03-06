# 네이버 오픈API 오류 코드 및 예외 처리 가이드

본 문서는 네이버 오픈API 연동 과정에서 발생할 수 있는 주요 오류 코드, HTTP 상태 코드 및 예외 처리 방법에 대해 상세히 안내합니다.

## 1. 개요

네이버 오픈API를 호출하면 API 서버는 처리 결과를 HTTP 상태 코드(HTTP Status Code)와 응답 본문(Response Body)을 통해 클라이언트에게 반환합니다. 
정상적으로 호출이 완료된 경우 200 레벨의 성공 코드가 반환되며, 요청에 문제가 있거나 서버에 예외 상황이 발생한 경우 400 레벨 또는 500 레벨의 오류 코드가 반환됩니다.

응답의 형식(JSON 또는 XML)은 사용 가능한 오픈 API 스펙과 요청 URL 확장에 따라 다를 수 있습니다. 따라서 안전한 API 연동을 위해서는 항상 HTTP 상태 코드를 먼저 검사하고, 오류가 발생한 경우 응답 본문에 포함된 상세 오류 코드를 파싱하여 대응해야 합니다.

---

## 2. HTTP 상태 코드 (응답 수준)

REST API의 원칙에 따라, 1차적으로 HTTP 응답 상태 코드를 통해 요청의 성공/실패 여부를 알 수 있습니다.

| HTTP 상태 코드 | 의미 | 설명 |
|---|---|---|
| **200 OK** | 정상 | API 호출이 성공적으로 수행되었으며 결괏값을 정상 반환함 |
| **400 Bad Request** | 잘못된 요청 | 필수 파라미터 누락, 지원하지 않는 API 호출, 혹은 잘못된 형식의 요청 데이터 전달 |
| **401 Unauthorized** | 인증 실패 | Access Token 또는 Client ID/Secret 값이 누락되었거나 유효하지 않음 |
| **403 Forbidden** | 접근 권한 없음 | API 사용 권한이 없거나 (예: 승인되지 않은 환경에서 호출), API 사용 한도가 초과됨 |
| **404 Not Found** | 리소스 없음 | 존재하지 않는 API 주소이거나 요청한 식별자의 데이터가 존재하지 않음 |
| **405 Method Not Allowed**| 메서드 허용 불가 | 해당 API에서 지원하지 않는 HTTP 메서드로 요청함 (예: GET 방식 API에 POST로 요청) |
| **429 Too Many Requests** | 호출 한도 초과 | 일일 또는 초당 허용된 API 호출 건수를 초과함 |
| **500 Internal Server Error**| 서버 내부 에러 | 네이버 오픈API 서버 내부 시스템 문제로 인해 요청을 처리하지 못함 |

---

## 3. 세부 오류 코드 (응답 본문 수준)

HTTP 상태 코드가 400, 500번대인 경우, 응답 본문에 보다 상세한 원인을 파악할 수 있는 `errorCode`와 `errorMessage`가 전달됩니다.

### 주요 오픈 API 공통 오류 코드
- **010**: 잘못된 Access Access Token이 사용됨. 토큰을 갱신하거나 재발급받아야 함.
- **011**: 잘못된 쿼리 요청 형식 (Incorrect query request). 파라미터 형식, 특수문자 인코딩 등을 다시 확인.
- **012**: 호출 한도 초과 오류 (Quota Exceeded). 허용된 일일 API 호출 건수를 모두 소진함.
- **024**: 인증 실패 (Authentication failed). 클라이언트 아이디, 시크릿 또는 Access Token 검증에 실패.
- **028**: 권한 승인되지 않은 애플리케이션 (Not authorized application). 내 애플리케이션 설정에서 해당 API의 사용 권한을 추가하지 않음.
- **031**: 잘못된 헤더 (Invalid application. Check header). `X-Naver-Client-Id` 등 필수 헤더가 누락되었거나 값 형식이 잘못됨.
- **100**: 시스템 에러. 네이버 서버 내부 처리 중 오류가 발생. 일시적일 수 있으므로 재시도 권장.

---

## 4. 오류 메시지 응답 형식

API 오류 발생 시, API가 지원하는 기본 포맷에 맞추어 오류 메시지가 반환됩니다. `translate.xml`과 같이 확장자가 명시된 API의 경우 XML로, 그 외 일반적인 REST API 호출의 경우 JSON 포맷으로 오류 응답이 반환됩니다.

### 4.1. JSON 응답 예시
가장 보편적인 오류 응답 형식입니다.
```json
{
  "errorMessage": "Authentication failed (인증에 실패하였습니다.)",
  "errorCode": "024"
}
```

### 4.2. XML 응답 예시
일부 XML 전용 엔드포인트를 호출할 때 나타나는 오류 구조입니다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<result>
  <errorMessage><![CDATA[Authentication failed (인증 실패하였습니다.)]]></errorMessage>
  <errorCode><![CDATA[024]]></errorCode>
</result>
```

---

## 5. 단계별 예외 처리 전략 (개발 가이드)

프로덕션 서비스에서 네이버 오픈API를 활용할 때는 위에서 정리한 코드를 바탕으로 한 견고한 예외 처리가 필수적입니다.

1. **HTTP Status Code 검사**:
   - HTTP 통신 자체가 성공했는지 확인합니다 (status `200`). status 코드가 `200`이 아닐 경우 예외 처리 컨트롤로 진입시킵니다.
2. **에러 내용 파싱**:
   - HTTP 상태 코드가 `4xx` 또는 `5xx`인 경우, 응답 Body 값을 JSON 구문으로 해석(parse)하여 `errorCode`와 `errorMessage`를 추출합니다.
3. **오류 대응 로직 분기**:
   - `429 (또는 코드 012)`: 사용 한도를 초과했다는 의미이므로, 즉각적인 재시도를 멈추고 캐시 데이터를 보여주거나 서비스 제한 안내 UI를 노출
   - `401 (또는 코드 010, 024)`: 토큰 만료 또는 인증키 문제이므로, Refresh Token을 통한 토큰 갱신 로직 실행 혹은 환경변수(Env)의 Client ID가 올바른지 확인
   - `500 (또는 코드 100)`: 네이버 API 서버 일시 장애 가능성이 높으므로 Retry(재시도) 로직을 백오프 알고리즘(Exponential Backoff)으로 전개하여 일정 시간 간격을 두고 2~3회 시도

## 6. 문의 및 지원
*   지속적으로 인증, 권한 관련 오류 코드가 나타난다면, [네이버 개발자센터 내 애플리케이션](https://developers.naver.com/apps/#/list) 설정에 등록된 'API 상태', 'API 설정(서비스 환경)'을 재검토 바랍니다.
*   기타 일시적 장애나 버그 리포팅은 [네이버 개발자 포럼](https://developers.naver.com/forum)을 통해 문의할 수 있습니다.
