"""
요즘IT - 기획(plan) 카테고리 아티클 크롤러

https://yozm.wishket.com/magazine/list/plan/ 에서 아티클 목록을 수집해
제목 / 글쓴이 / 발행일 / 카테고리 / 원문링크 를 CSV로 저장한다.

실행:
    python3 yozm_plan_crawler.py

필요 패키지:
    pip3 install -r requirements.txt
"""

import csv
import re
import time
from datetime import date, timedelta
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = "https://yozm.wishket.com/magazine/list/plan/"
ARTICLES_PER_PAGE = 10
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
OUTPUT_CSV = "yozm_plan_crawled.csv"

# 사용자가 지정한 10개 카테고리. 기사 본문/제목에 등장하는 키워드로 분류하며,
# 여러 카테고리에 동시에 해당하면 전부 담는다(콤마 구분). 아무 키워드도 안 걸리면
# 이 크롤러가 수집하는 대상이 '기획' 섹션이므로 기본값으로 '기획'을 붙인다.
CATEGORY_KEYWORDS = {
    "기획": ["기획", "PM", "PO", "프로덕트 매니저", "요구사항", "로드맵", "PRD"],
    "IT": ["IT", "플랫폼", "테크"],
    "개발": ["개발", "코드", "프로그래밍", "API", "백엔드", "프론트엔드", "엔지니어", "아키텍처", "배포"],
    "협업": ["협업", "팀워크", "애자일", "스크럼", "조직문화", "워크플로우"],
    "디자인": ["디자인", "비주얼", "컬러", "타이포그래피", "브랜딩"],
    "AI": ["AI", "인공지능", "GPT", "LLM", "머신러닝", "딥러닝", "생성형", "챗봇"],
    "커뮤니케이션": ["커뮤니케이션", "소통", "보고서", "글쓰기", "설득", "발표"],
    "비즈니스": ["비즈니스", "전략", "매출", "수익", "시장", "창업", "스타트업", "ROI", "마케팅", "KPI"],
    "데이터": ["데이터", "SQL", "통계", "지표", "DB", "분석"],
    "UIUX": ["UX", "UI/UX", "사용자 경험", "와이어프레임", "프로토타입", "UI"],
}
DEFAULT_CATEGORY = "기획"


def ask_headless() -> bool:
    answer = input("헤드리스 모드로 실행할까요? (y/n): ").strip().lower()
    return answer in ("y", "yes", "예", "ㅇ")


def ask_page_count() -> int:
    while True:
        raw = input(
            f"몇 페이지까지 수집할까요? (더보기 버튼 기준, 1페이지당 {ARTICLES_PER_PAGE}개): "
        ).strip()
        if raw.isdigit() and int(raw) > 0:
            return int(raw)
        print("1 이상의 숫자를 입력해주세요.")


def build_driver(headless: bool) -> webdriver.Chrome:
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument(f"--user-agent={USER_AGENT}")
    options.add_argument("--window-size=1400,1000")
    return webdriver.Chrome(options=options)


def parse_relative_date(text: str, today: date) -> str:
    text = text.strip()

    m = re.match(r"^(\d{4})\.(\d{2})\.(\d{2})\.?$", text)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"

    if text in ("오늘", "방금 전"):
        return today.isoformat()
    if text == "어제":
        return (today - timedelta(days=1)).isoformat()

    m = re.match(r"^(\d+)일\s*전$", text)
    if m:
        return (today - timedelta(days=int(m.group(1)))).isoformat()

    if re.match(r"^(\d+)(시간|분)\s*전$", text):
        return today.isoformat()

    return text  # 알 수 없는 형식이면 원문 그대로 반환


def fetch_article_cards(driver: webdriver.Chrome, page: int):
    url = f"{BASE_URL}?page={page}"
    driver.get(url)
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.TAG_NAME, "article"))
        )
    except TimeoutException:
        return []

    soup = BeautifulSoup(driver.page_source, "html.parser")
    return soup.find_all("article")


def parse_card(article, today: date):
    title_tag = article.find("h3")
    link_tag = article.find("a", href=re.compile(r"^/magazine/detail/"))
    author_anchor = article.find("a", href=re.compile(r"^/magazine/@"))

    if not title_tag or not link_tag:
        return None

    title = title_tag.get_text(strip=True)
    url = urljoin(BASE_URL, link_tag["href"])
    author = ""
    if author_anchor:
        author_span = author_anchor.find("span")
        author = author_span.get_text(strip=True) if author_span else author_anchor.get_text(strip=True)

    raw_date = ""
    date_row = title_tag.find_next_sibling("div")
    if date_row:
        spans = date_row.find_all("span")
        if len(spans) > 1:
            raw_date = spans[1].get_text(strip=True)
        elif spans:
            raw_date = spans[0].get_text(strip=True)
    published_date = parse_relative_date(raw_date, today) if raw_date else ""

    return {"title": title, "url": url, "author": author, "date": published_date}


def fetch_classification_text(session: requests.Session, url: str) -> str:
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except requests.RequestException:
        return ""

    soup = BeautifulSoup(resp.text, "html.parser")
    parts = []
    for attr in ("description", "og:keyword"):
        tag = soup.find("meta", attrs={"name": attr}) or soup.find("meta", attrs={"property": attr})
        if tag and tag.get("content"):
            parts.append(tag["content"])
    og_desc = soup.find("meta", attrs={"property": "og:description"})
    if og_desc and og_desc.get("content"):
        parts.append(og_desc["content"])
    return " ".join(parts)


def classify_categories(text: str) -> list[str]:
    matched = []
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw.lower() in lowered for kw in keywords):
            matched.append(category)
    return matched or [DEFAULT_CATEGORY]


def main():
    headless = ask_headless()
    page_count = ask_page_count()

    driver = build_driver(headless)
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    today = date.today()

    rows = []
    try:
        for page in range(1, page_count + 1):
            print(f"[{page}/{page_count}] 페이지 수집 중...")
            cards = fetch_article_cards(driver, page)
            if not cards:
                print(f"  페이지 {page}에서 더 이상 기사를 찾지 못해 중단합니다.")
                break

            for card in cards:
                parsed = parse_card(card, today)
                if not parsed:
                    continue

                classification_text = parsed["title"] + " " + fetch_classification_text(session, parsed["url"])
                categories = classify_categories(classification_text)

                rows.append(
                    {
                        "제목": parsed["title"],
                        "글쓴이": parsed["author"],
                        "발행일": parsed["date"],
                        "카테고리": ", ".join(categories),
                        "원문링크": parsed["url"],
                    }
                )
                print(f"  - {parsed['title']} ({', '.join(categories)})")
                time.sleep(0.3)
    finally:
        driver.quit()

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["제목", "글쓴이", "발행일", "카테고리", "원문링크"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n총 {len(rows)}개 아티클을 {OUTPUT_CSV} 에 저장했습니다.")


if __name__ == "__main__":
    main()
