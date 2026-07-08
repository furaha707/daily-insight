"""
서핏(Surfit) 홈 피드 크롤러 (무한스크롤)

https://www.surfit.io/ 홈 피드를 스크롤하며 아티클을 수집해
제목 / 글쓴이 / 발행일 / 카테고리 / 원문링크 를 CSV로 저장한다.

원문 링크는 카드에 걸린 https://surfit.io/link/{id} 리다이렉트 주소를 따라가
실제 원문 URL(예: https://zoey.day/blog?...)로 변환한다.

실행:
    python3 surfit_crawler.py

필요 패키지:
    pip3 install -r requirements.txt
"""

import csv
import time

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

BASE_URL = "https://www.surfit.io/"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
OUTPUT_CSV = "surfit_crawled.csv"
SCROLL_PAUSE_SECONDS = 1.3
MAX_STAGNANT_SCROLLS = 4  # 이만큼 스크롤해도 새 카드가 안 늘면 포기하고 중단

# 서핏 카드에는 자체 태그(예: "서비스 기획", "브랜드 디자인", "창업 · 투자")가 붙어있다.
# 제목 + 태그 텍스트에 아래 키워드가 있으면 해당 카테고리로 분류한다(중복 허용).
CATEGORY_KEYWORDS = {
    "기획": ["기획", "PM", "PO", "프로덕트 매니저", "요구사항", "로드맵", "PRD", "프로덕트"],
    "IT": ["IT", "플랫폼", "테크", "웹사이트"],
    "개발": ["개발", "코드", "프로그래밍", "API", "백엔드", "프론트엔드", "엔지니어", "아키텍처", "배포", "Java", "React", "Infra", "인프라"],
    "협업": ["협업", "팀워크", "애자일", "스크럼", "조직문화", "조직 문화", "HR", "워크플로우"],
    "디자인": ["디자인", "비주얼", "컬러", "타이포그래피", "브랜딩", "브랜드"],
    "AI": ["AI", "인공지능", "GPT", "LLM", "머신러닝", "딥러닝", "생성형", "챗봇"],
    "커뮤니케이션": ["커뮤니케이션", "소통", "보고서", "글쓰기", "설득", "발표"],
    "비즈니스": ["비즈니스", "전략", "매출", "수익", "시장", "창업", "스타트업", "ROI", "마케팅", "KPI", "투자", "사업"],
    "데이터": ["데이터", "SQL", "통계", "지표", "DB", "분석", "Database", "빅데이터"],
    "UIUX": ["UX", "UI/UX", "사용자 경험", "와이어프레임", "프로토타입", "UI"],
}
# 이 피드는 특정 섹션 전용이 아니라 전체 주제를 다루므로, 아무 키워드도 안 걸리면
# 가장 포괄적인 카테고리인 'IT'를 기본값으로 붙인다.
DEFAULT_CATEGORY = "IT"


def ask_headless() -> bool:
    answer = input("헤드리스 모드로 실행할까요? (y/n): ").strip().lower()
    return answer in ("y", "yes", "예", "ㅇ")


def ask_target_count() -> int:
    while True:
        raw = input("몇 개까지 수집할까요? (예: 200): ").strip()
        if raw.isdigit() and int(raw) > 0:
            return int(raw)
        print("1 이상의 숫자를 입력해주세요.")


def build_driver(headless: bool) -> webdriver.Chrome:
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument(f"--user-agent={USER_AGENT}")
    options.add_argument("--window-size=1400,1200")
    return webdriver.Chrome(options=options)


def parse_card(article):
    title_tag = article.select_one("a.ellipsis.title")
    author_tag = article.select_one("a.author-name")
    time_tag = article.select_one("time")

    if not title_tag or not title_tag.get("href"):
        return None

    return {
        "title": title_tag.get_text(strip=True),
        "redirect_url": title_tag["href"],
        "author": author_tag.get_text(strip=True) if author_tag else "",
        "date": (time_tag["datetime"][:10] if time_tag and time_tag.get("datetime") else ""),
        "tags": [t.get_text(strip=True) for t in article.select("a.tag-item")],
    }


def collect_cards(driver: webdriver.Chrome, target_count: int):
    driver.get(BASE_URL)
    time.sleep(3)

    seen_cids = set()
    cards = []
    stagnant_rounds = 0

    while len(cards) < target_count and stagnant_rounds < MAX_STAGNANT_SCROLLS:
        soup = BeautifulSoup(driver.page_source, "html.parser")
        new_found = 0
        for article in soup.select("article.ct-item"):
            cid = article.get("data-cid")
            if not cid or cid in seen_cids:
                continue
            parsed = parse_card(article)
            if not parsed:
                continue
            seen_cids.add(cid)
            cards.append(parsed)
            new_found += 1

        print(f"  누적 {len(cards)}개 수집...")
        if len(cards) >= target_count:
            break

        stagnant_rounds = stagnant_rounds + 1 if new_found == 0 else 0
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE_SECONDS)

    if len(cards) < target_count:
        print(f"  더 이상 새 기사가 로드되지 않아 {len(cards)}개만 수집했습니다.")

    return cards[:target_count]


def resolve_original_url(session: requests.Session, redirect_url: str) -> str:
    try:
        resp = session.head(redirect_url, allow_redirects=True, timeout=10)
        if resp.status_code < 400:
            return resp.url
    except requests.RequestException:
        pass

    try:
        resp = session.get(redirect_url, allow_redirects=True, timeout=10, stream=True)
        resp.close()
        return resp.url
    except requests.RequestException:
        return redirect_url


def classify_categories(text: str) -> list[str]:
    matched = []
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw.lower() in lowered for kw in keywords):
            matched.append(category)
    return matched or [DEFAULT_CATEGORY]


def main():
    headless = ask_headless()
    target_count = ask_target_count()

    driver = build_driver(headless)
    try:
        print("피드를 스크롤하며 카드를 수집하는 중...")
        cards = collect_cards(driver, target_count)
    finally:
        driver.quit()

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    rows = []
    for i, card in enumerate(cards, 1):
        original_url = resolve_original_url(session, card["redirect_url"])
        classification_text = card["title"] + " " + " ".join(card["tags"])
        categories = classify_categories(classification_text)

        rows.append(
            {
                "제목": card["title"],
                "글쓴이": card["author"],
                "발행일": card["date"],
                "카테고리": ", ".join(categories),
                "원문링크": original_url,
            }
        )
        print(f"[{i}/{len(cards)}] {card['title']} ({', '.join(categories)})")
        time.sleep(0.2)

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["제목", "글쓴이", "발행일", "카테고리", "원문링크"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n총 {len(rows)}개 아티클을 {OUTPUT_CSV} 에 저장했습니다.")


if __name__ == "__main__":
    main()
