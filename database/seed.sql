-- ============================================================
-- [dailyInsight] articles 시드 데이터
-- database/db_article1.csv, db_article2.csv 를 변환하여 생성
-- 총 103건 (중복 URL 49건 제외)
-- Supabase 대시보드 > SQL Editor 에서 schema.sql 실행 후 이 파일을 실행하세요.
-- url에 unique 제약이 있어 재실행해도 중복으로 쌓이지 않습니다 (ON CONFLICT DO NOTHING).
-- ============================================================

insert into public.articles (title, url, categories, skill_type, author, recommend_reason, published_at)
values
('딜리버리 프로덕트 개발팀의 개발문화 - 로그 & 알람편', 'https://helloworld.kurly.com/blog/deliveryproductteam-culture-1/', '{"개발프로세스","데이터"}', '하드스킬', null, '새벽배송, 컬리나우, 택배 문제 상황을 인식하고 해결하는 과정을 보실 수있습니다.', '2025-01-14'),
('웬만하면 다 통하는 PM 면접 방법론 + 질문 리스트', 'https://brunch.co.kr/@jiseonchoi/41', '{"취업"}', '소프트스킬', null, '짧지만 강하다! 
이 작가의 다른 글도 꼭 읽어보시길 추천합니다. 우리는 취준생이니까 😂', '2025-01-27'),
('속성을 활용한 추천 고도화 : Part 2. 무신사가 개인화 추천을 하는 방법', 'https://medium.com/musinsa-tech/%EC%86%8D%EC%84%B1%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%B6%94%EC%B2%9C-%EA%B3%A0%EB%8F%84%ED%99%94-part-2-%EB%AC%B4%EC%8B%A0%EC%82%AC%EA%B0%80-%EA%B0%9C%EC%9D%B8%ED%99%94-%EC%B6%94%EC%B2%9C%EC%9D%84-%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95-71f7aeb1dc5d', '{}', '소프트스킬', null, null, '2024-07-24'),
('기획자의 포트폴리오 작성법', 'https://yozm.wishket.com/magazine/detail/2148/', '{}', null, null, null, null),
('데이터베이스 기초 이해하기', 'https://yozm.wishket.com/magazine/detail/2908/', '{"데이터"}', '하드스킬', null, 'PM이라면 이해하고 있으면 좋을 개발관련 용어 -2', '2025-01-14'),
('UI나 UX나 그게 그거 아니야?', 'https://rbworld.tistory.com/130', '{"디자인"}', '소프트스킬', null, '네모세모 사용해서 스케치를 그려주는 작업도 은근 많아요', '2021-03-14'),
('팀원을 설득하는 리더의 소프트 스킬', 'https://brunch.co.kr/@goodgdg/168', '{"문제해결역량"}', '소프트스킬', null, '기획서에 설득력까지 얹으면 글과 말을 모두 잘하는 사람이 되는 겁니다!', '2022-06-26'),
('브라이언 체스키가 Airbnb에서 PM을 없애버린 이유', 'https://maily.so/josh/posts/5xrx17lyz2v', '{"비즈니스"}', '소프트스킬', null, '자극적인 제목이지만, 우리가 하고자 하는 일에 대한 중요성을 다시끔 깨달을 수 있습니다.', '2025-01-06'),
('지표가 좋으면 UX도 좋은걸까', 'https://toss.im/simplicity-24/session/1', '{"기획","문제해결역량","비즈니스"}', '하드스킬', null, '비즈니스와 사용자 경험 사이의 균형이라는 이상을 쫓아서', '2025-01-13'),
('“어떤 기능부터?" 스타트업 MVP 우선순위 정하는법', 'https://brunch.co.kr/@bfddd4eb2981454/34', '{"기획"}', '하드스킬', null, null, '2025-09-04'),
('개발자가 안된다고 말했다', 'https://velog.io/@okko8522/%EC%98%A4%EB%8A%98%EB%8F%84-%EA%B0%9C%EB%B0%9C%EC%9E%90%EA%B0%80-%EC%95%88-%EB%90%9C%EB%8B%A4%EA%B3%A0-%EB%A7%90%ED%96%88%EB%8B%A4', '{"커뮤니케이션"}', '소프트스킬', null, '개발자와 소통을 하며 관점의 차이를 잘 정리하였습니다.  추가로 진짜 현업에 쓰이는 일들이 적혀 있어요!', '2022-11-27'),
('유저 데이터 분석? 그거 중요한거야?', 'https://community.heartcount.io/ko/user-data-anlaysis/?utm_source=yozm-it&utm_medium=refferal&utm_campaign=user-data-anlaysis', '{"기획","마케팅","문제해결역량","비즈니스"}', '하드스킬', null, '어떻게 하면 가설을 세우고 검증할까?
데이터 분석 관점에서 대비해보기!', '2025-01-06'),
('리더와 실무진을 설득하는 PRD 작성 마스터하기 (ft. PO & PM Lounge) 회고', 'https://wow-moment.tistory.com/13', '{}', '소프트스킬', null, null, '2024-02-17'),
('디자이너가 협업하고 싶은 PM', 'https://brunch.co.kr/@designmonkey/5?utm_source=oneoneone', '{"커뮤니케이션"}', '소프트스킬', null, '디자인만큼 수정이 많은 작업이 없는데 웃으면서 일해야죠 😀', '2023-04-22'),
('커머스 사례로 보는 인풋 지표와 아웃풋 지표', 'https://yozm.wishket.com/magazine/detail/2166/', '{"기획","마케팅","비즈니스"}', '하드스킬', null, '우리가 보는 데이터들의 진위여부 혹은 타당성은 어떻게 정의될까? 정의된다고 한들 과연 정답일까? 

이커머스 재밌다…', '2025-01-07'),
('초보 PM/PO를 위한 KPI 작성예시(feat. GoalTree)', 'https://www.openads.co.kr/content/contentDetail?contsId=12767', '{"기획","비즈니스"}', '하드스킬', null, 'KPI 설정은 항상 막연하고 어려운데, 다양한 프레임워크를 알고 있으면 좋을 것 같습니다.', '2024-03-15'),
('랜딩페이지, 지루하지 않게 만드는 방법', 'https://maily.so/unsexybusinesskr/posts/wdr9j0llzlx', '{"디자인","마케팅"}', '하드스킬', null, '? : 예…? 제가 랜딩페이지를 왜요..?
T : 당신과 마케팅은 그다지 멀지 않습니다.', '2025-01-06'),
('PMI, 2024 글로벌 프로젝트 직무 관리동향 보고서 발표', 'https://www.cio.com/article/3521620/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EB%A7%A4%EB%8B%88%EC%A0%80-21%EA%B0%80-ai-%ED%99%9C%EC%9A%A9%C2%B7%C2%B7%C2%B7-pmi-2024-%EA%B8%80%EB%A1%9C%EB%B2%8C-%ED%94%84%EB%A1%9C%EC%A0%9D.html', '{"AI"}', '소프트스킬', null, 'PM의 요즘 트렌드!', '2024-05-20'),
('서비스 기획자의 기획서: 상위 기획서, 하위 기획서', 'https://www.openads.co.kr/content/contentDetail?contsId=16317', '{"AI","협업"}', '하드스킬', null, null, '2025-05-23'),
('고객의 진짜 문제, 어떻게 정의하지?', 'https://eopla.net/magazines/33825', '{}', null, null, null, null),
('7년차 기획자의 커뮤니케이션 실제 사례', 'https://yozm.wishket.com/magazine/detail/2274/', '{"커뮤니케이션"}', '소프트스킬', null, '경험만큼 좋은 교과서는 없어요.', '2023-10-18'),
('컬리는 어떻게 10년만에 적자를 탈출했을까?', 'https://www.openads.co.kr/content/contentDetail?contsId=16369', '{"데이터","문제해결역량"}', '하드스킬', null, null, '2025-05-29'),
('이렇게 고치니까 전문가처럼 보이네', 'https://youtube.com/shorts/9ni1QCiXL0w?si=y4UuiDXwTPlF1o7P', '{"디자인"}', '하드스킬', null, '쇼츠영상 다른버전!
이것은 사업제안서나 제품소개서를 작성할 때 필요한 레이아웃으로 보여요. 
> 이것도 PM이 하나요? 사람이 없으면 그럴 수도 있습니다…', '2025-01-05'),
('좋은 PM을 위한 MVP 프라이머', 'https://brunch.co.kr/@ywkim36/28', '{"기획"}', '하드스킬', null, null, '2020-08-29'),
('AI 시대 기획자가 GPT로 타깃 고객 분석하는 법', 'https://yozm.wishket.com/magazine/detail/3222/', '{}', '하드스킬', null, null, '2025-07-07'),
('존경받는 리더들이 가지고 있는 커뮤니케이션 패턴', 'https://yozm.wishket.com/magazine/detail/152/', '{"커뮤니케이션"}', '소프트스킬', null, '저도 자주 쓰는 말 “죄송한데 갑자기 여담 하나 해도 될까요 ㅎㅎ?”', '2021-01-08'),
('AI로 UX-Writing 툴만들기', 'https://www.gpters.org/ai-writing/post/everyone-likes-toss-creating-EJy7lIT7oDsoxkR', '{"AI","기획","커뮤니케이션"}', '하드스킬', null, 'AI의 도입, 시작은 미약하나 끝은 창대하리라', '2025-01-13'),
('서비스 기획자의 뷰티컬리로 확장하기', 'https://helloworld.kurly.com/blog/expand-to-Beauty-Kurly/', '{"기획","커뮤니케이션","협업"}', '소프트스킬', null, '실제로 서비스를 오픈할 때의 PM의 사고 방식을 알 수 있다.', '2023-07-06'),
('기획자가 알아야 할 건 왜 이렇게 많아요? 용어&개념 A to Z', 'https://yozm.wishket.com/magazine/detail/2767/', '{"기획"}', '하드스킬', null, '그래도 우리 기본 지식 정도는..?', '2025-01-06'),
('UX 데이터 분석부터 퍼소나 생성까지, 어피니티버블 사용기', 'https://yozm.wishket.com/magazine/detail/3671/', '{"AI툴","데이터"}', '소프트스킬', null, null, '2026-03-24'),
('기획자가 알아야 할 오픈 API 활용 사례', 'https://yozm.wishket.com/magazine/detail/2191/', '{"기획"}', '하드스킬', null, '실무에서 많이 사용하는 API. 창조는 편집이다', '2023-08-23'),
('팝업, 모달, 논모달 뭐가 다른걸까?', 'https://brunch.co.kr/@8eaf677337d14e8/14?utm_source=oneoneone', '{"기획","디자인"}', '소프트스킬', null, '오, 이런 단어 정의도 은근 중요해요! 확실하게 알고 넘어가봐요', '2023-04-27'),
('PRD(제품 요구사항 정의서)의 모든 것', 'https://brunch.co.kr/@sparkplus/566?utm_source=oneoneone', '{"기획"}', '소프트스킬', null, '진짜 일을 하게 되면 
이런 준비단계도 하게 될 거에요.
바로 넘어갈 수도 있지만 이 단계도 있다는 것을 알아두세요!', '2023-04-24'),
('삶의 질을 높여주는 10가지 UX 사례(7탄)', 'https://brunch.co.kr/@maju/71', '{}', '소프트스킬', null, null, '2025-06-30'),
('토스는 어떻게 슈퍼앱이 되었을까?', 'https://yozm.wishket.com/magazine/detail/2633/', '{"비즈니스"}', '소프트스킬', null, '하나의 장르로 생겨버린 핀테크. 괜히 전문적인 분야가 아니라구요. 여기서 배울건 ‘금융’ 이라는 어려운 분야를 쉽게 유저들에게 다가갈수 있게 노력했다는 걸 알아야 합니다', '2024-06-17'),
('IA, 메뉴구조도, 화면 목록이 헷갈린다면?', 'https://yozm.wishket.com/magazine/detail/1606/', '{"기획"}', '소프트스킬', null, 'IA를 작성하고 기획서를 작성하면 내용을 빼먹을 일이 없습니다!', '2022-07-06'),
('유망 직군 ‘PM’ 되려면 문제 정의ㆍ해결 능력 갖춰야', 'https://www.mediafine.co.kr/news/articleView.html?idxno=63310', '{"커뮤니케이션"}', '하드스킬', null, '실제 PM의 인터뷰를 통해 실무를 경험해 볼 수 있어요', '2025-01-14'),
('PO 미신, 파랑새를 찾아서 - CPO 김용훈', 'https://www.youtube.com/watch?v=u5MaPf6nntw', '{"기획","커뮤니케이션","협업"}', '소프트스킬', null, '기획자, PM, PO 어떻게 다를까요?', '2025-01-27'),
('AI로 더 똑똑하게 페르소나와 저니맵 만드는 법', 'https://yozm.wishket.com/magazine/detail/3230/', '{}', null, null, null, null),
('답답한 개발자와의 커뮤니케이션 의사소통 꿀팁 몇가지', 'https://youtu.be/F0OfxCDCYFo?si=xI1U8JGf3hgzQ-DG', '{"커뮤니케이션"}', '소프트스킬', null, '사람마다 말투는 다르지만 
의미 전달 수단은 비슷하잖아요?', '2024-03-25'),
('''스몰 브랜드''를 위한 브랜딩', 'https://yozm.wishket.com/magazine/detail/2799/', '{}', null, null, null, null),
('IT 실무용어 모음집', 'https://wbtw-baku.tistory.com/entry/%EC%8B%A4%EB%AC%B4%EC%97%90%EC%84%9C-%EC%93%B0%EC%9D%B4%EB%8A%94-%ED%95%84%EC%88%98-%EC%9A%A9%EC%96%B4-%ED%8C%A8%EC%8A%A4%ED%8A%B8%EC%BA%A0%ED%8D%BC%EC%8A%A4X%EC%95%BC%EB%86%80%EC%9E%90-%EB%B6%80%ED%8A%B8%EC%BA%A0%ED%94%84-%ED%94%84%EB%A1%9C%EB%8D%95%ED%8A%B8-%EB%A7%A4%EB%8B%88%EC%A0%80PM-1%EA%B8%B0', '{"커뮤니케이션"}', '소프트스킬', null, '실무에서 자주 사용하는 IT 용어들을 정리하여 신입PM에게 도움이 될 것 같아요', '2023-09-16'),
('왓챠는 왜 실패했을까', 'https://yozm.wishket.com/magazine/detail/3330/', '{}', null, null, null, null),
('인하우스 개발, 몇 명이나 필요할까?', 'https://yozm.wishket.com/magazine/detail/2912/', '{"커뮤니케이션"}', '하드스킬', null, '자체적으로 개발팀을 가지게 될 경우에는 이정도 인력이 필요해요. 알아두면 프로젝트를 리딩 할 때 필요한 리소스를 한 눈에 파악이 될 거에요.', '2024-12-31'),
('어느 면접관 입장에서 인상적이었던 지원자의 질문', 'https://www.linkedin.com/feed/update/urn:li:activity:7272158158150668289/?commentUrn=urn%3Ali%3Acomment%3A(activity%3A7272158158150668289%2C7278404254166368256)&dashCommentUrn=urn%3Ali%3Afsd_comment%3A(7278404254166368256%2Curn%3Ali%3Aactivity%3A7272158158150668289)', '{"커뮤니케이션"}', '소프트스킬', null, '풀무원 상무님의 진짜 면접 이야기
(feat. 튜터가 직접 물어봄)', '2025-01-06'),
('기획자로서 알아야 하는 앱 개발 유형', 'https://brunch.co.kr/@pak6477/15', '{"기획"}', '소프트스킬', null, '이게 매운 라면인지, 하얀국물 라면인지는 알아야 하잖아요… 어플도 개발 종류가 있답니다', '2022-02-20'),
('주니어 서비스 기획자에게 필요한 진짜 개발 지식', 'https://brunch.co.kr/@newbyeol/11', '{"커뮤니케이션"}', '소프트스킬', null, '이 정도만 알아도 IT프로젝트 베이스를 알수있다 봐야죠', '2020-04-23'),
('PO가 비즈니스 전략을 제품에 녹이는 방법', 'https://blog.gangnamunni.com/post/how-to-reflect-business-strategy-in-your-product/?utm_source=trendlite&utm_medium=email&utm_campaign=230111', '{"기획","문제해결역량","비즈니스"}', '하드스킬', null, '우리의 ‘진짜’ 역할은 무엇일까?
또, 우리는 어떻게 이야기하며, 어떻게 설득할 것인가?', '2025-01-08'),
('AI는 어디에 둘까? UI 속 위치가 만드는 사용자 경험', 'https://yozm.wishket.com/magazine/detail/3287/', '{}', null, null, null, null),
('설득하는 글을 쓰는 가장 쉬운 구조', 'https://velog.io/@beneform/%EC%84%A4%EB%93%9D%ED%95%98%EB%8A%94-%EA%B8%80%EC%9D%84-%EC%93%B0%EB%8A%94-%EA%B0%80%EC%9E%A5-%EC%89%AC%EC%9A%B4-%EA%B5%AC%EC%A1%B0', '{"커뮤니케이션"}', '하드스킬', null, '지금까지 제가 사용하는 글, 말하기 문장 구조에요!', '2021-07-24'),
('작은 경험으로 합격하는 PM 포트폴리오 만드는 팁', 'https://brunch.co.kr/@ny0303/126', '{"취업"}', '소프트스킬', null, null, '2025-06-09'),
('‘소셜’ 지워지는 소셜미디어, 이대로 끝나는 걸까?', 'https://yozm.wishket.com/magazine/detail/3243/', '{"비즈니스"}', '소프트스킬', null, null, '2025-07-17'),
('소프트웨어 설계 20년 해보고 깨달은 ‘좋은설계’ 의 조건', 'https://yozm.wishket.com/magazine/detail/1884/', '{"문제해결역량","커뮤니케이션"}', '하드스킬', null, '결국 정답이 없다는 것을 알게 되는 유의미한 글.', '2023-02-03'),
('프로덕트 매니저로서, 내가 업무에서 ChatGPT를 사용하는 방법', 'https://managemylife.tistory.com/entry/%EB%B2%88%EC%97%AD-%ED%94%84%EB%A1%9C%EB%8D%95%ED%8A%B8-%EB%A7%A4%EB%8B%88%EC%A0%80%EB%A1%9C%EC%8D%A8-%EB%82%B4%EA%B0%80-%EC%97%85%EB%AC%B4%EC%97%90%EC%84%9C-ChatGPT%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95?utm_source=chatgpt.com', '{"AI"}', '하드스킬', null, '대외적인 업무를 할 때 지피티 활용법. 이렇게도 사용 가능하답니다.', '2024-07-26'),
('프로젝트 관리자(PM)의 가장 중요한 덕목은 무엇인가?', 'https://www.cio.com/article/3615190/%EC%A0%95%EC%B2%A0%ED%99%98-%EC%B9%BC%EB%9F%BC-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EA%B4%80%EB%A6%AC%EC%9E%90pm%EC%9D%98-%EA%B0%80%EC%9E%A5-%EC%A4%91%EC%9A%94%ED%95%9C-%EB%8D%95%EB%AA%A9.html', '{"문제해결역량"}', '소프트스킬', null, 'PM으로써 자존감이 높아지는 이야기, 우린 대단한 사람이 될 수 있어요.', '2024-12-01'),
('2024년 UX/UI 디자인 트렌드', 'https://yozm.wishket.com/magazine/detail/2412/', '{"디자인"}', '소프트스킬', null, '디자인도 트렌드를 훑어봐야지 나중에 기획서 스케치 할 때 도움이 된 답니다. 아 진짜로요!', '2024-01-11'),
('역량만 있어선 안 된다… IT 프로젝트가 여전히 실패하는 8가지 이유', 'https://www.cio.com/article/3519859/%EC%97%AD%EB%9F%89%EB%A7%8C-%EC%9E%88%EC%96%B4%EC%84%A0-%EC%95%88-%EB%90%9C%EB%8B%A4-it-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%EA%B0%80-%EC%97%AC%EC%A0%84%ED%9E%88-%EC%8B%A4%ED%8C%A8%ED%95%98.html', '{"비즈니스"}', '소프트스킬', null, null, '2022-01-26'),
('달라진 PM 직무 트렌드 따라잡기 | 스킬과 기술로는 부족한 이유', 'https://youtu.be/dOdKwrIQkDs?si=cmeCXJIatLbzbyca', '{"문제해결역량"}', '소프트스킬', null, '트렌드일 뿐이지 중요한건 자신만의 색깔을 갖추는 게 중요해요', '2023-04-23'),
('프로덕트, 어떻게 만들어야 하나요?', 'https://brunch.co.kr/@hijinnyjinny/29', '{"기획","문제해결역량","비즈니스"}', '하드스킬', null, '쉽지 않다..진짜 비즈니스 얘기', '2021-01-08'),
('취업이 힘들수록 질문하는 사람이 살아남는다', 'https://yozm.wishket.com/magazine/detail/3201/', '{"문제해결역량"}', '소프트스킬', null, null, '2025-06-24'),
('백오피스 시스템 기획 시 TIPS', 'https://brunch.co.kr/@okcomputer/27', '{"기획"}', '하드스킬', null, '관리자&어드민 페이지 및 기능도 우리 담당인지 몰랐죠?', '2022-03-06'),
('어디다 시선을 둬야해', 'https://youtube.com/shorts/WM64Krrl8Lo?si=SCJ-wdLHCQCvfXqS', '{"디자인"}', '하드스킬', null, '업무보고나 발표자료 만드는 작업 할 때 디자인이나 레이아웃을 참고하면 매우 좋을 것 같아요!', '2024-12-30'),
('구글, 메타 PM이 알려주는 AI PM이 되는 법', 'https://yozm.wishket.com/magazine/detail/3209/', '{}', null, null, null, null),
('IT 서비스 초기 기획', 'https://brunch.co.kr/@segimalpm/29', '{}', null, null, null, null),
('듣는 사람이 프로젝트에 공감하게끔 만들어내는 PM이 차별화 된 PM이라고 생각해요.', 'https://medium.com/@project10pm/듣는-사람이-프로젝트에-공감하게끔-만들어내는-pm이-차별화-된-pm이라고-생각해요-수호님-604ad43e8180', '{"커뮤니케이션"}', '하드스킬', null, '내용은 어렵지만 자세히 읽다보면 꿀팁이 많이 보여요. 특히 6번', '2024-09-08'),
('제품 주도 성장 101', 'https://brunch.co.kr/@taewookim/104?utm_source=oneoneone', '{"비즈니스"}', '하드스킬', null, '사업에 관심이 많다면 이렇게 시작하는 것이 좋아보이네요', '2023-04-24'),
('구글코리아 첫 번째 PM이 국회의원 된 사연', 'https://yozm.wishket.com/magazine/detail/3285/', '{"문제해결역량"}', '소프트스킬', null, null, '2025-08-24'),
('모두가 알지만 누구도 제대로 쓰지 못하는, PRD', 'https://yozm.wishket.com/magazine/detail/2826/', '{"기획"}', '소프트스킬', null, null, '2024-11-01'),
('쿠키와 세션, 그리고 캐시', 'https://germweapon.tistory.com/426', '{"개발프로세스","기획"}', '하드스킬', null, 'PM이라면 이해하고 있으면 좋을 개발관련 용어 -1', '2025-01-14'),
('유저 플로우 케이스 스터디:AI로 통합하는 독서 경험', 'https://yozm.wishket.com/magazine/detail/1524/', '{"기획","디자인"}', '소프트스킬', null, null, '2022-06-13'),
('개발 커뮤니케이션 -API, Json', 'https://de-developer.tistory.com/20', '{"커뮤니케이션"}', '소프트스킬', null, '추가로 기능을 개발하거나 업데이트 할 때 API 를 자주 사용 할 수 있어요. 개념이라도 알고 있으면 좋을 것 같아요', '2019-04-21'),
('성장하지 못하는 PM의 착각', 'https://yozm.wishket.com/magazine/detail/2854/', '{"기획","문제해결역량"}', '하드스킬', null, '제 자신도 돌아보게 되는 아티클이네요 (먼산)', '2024-11-20'),
('커뮤니티 서비스 만들지 마세요, 어차피 실패합니다', 'https://yozm.wishket.com/magazine/detail/2422/', '{"기획"}', '소프트스킬', null, null, '2024-01-18'),
('나이키에게 30조원 재앙을 부른 데이터 드리븐', 'https://brunch.co.kr/@uxn00b/343?fbclid=IwY2xjawFpbxlleHRuA2FlbQIxMQABHYEf4Af_a_FWRjptQDxNi0NX2E9B76JRHa3afHAafufHNJKht5fSg4gIxg_aem_W3y0Y9RTSIn5fCPbceItNQ&sfnsn=mo', '{"기획","문제해결역량","비즈니스"}', '하드스킬', null, '데이터는 만능열쇠 키가 아닙니다', '2025-01-13'),
('PO의 커뮤니케이션, 이것만 기억하자!', 'https://brunch.co.kr/@kaily/28', '{"커뮤니케이션"}', '소프트스킬', null, '커뮤니케이션의 기본, 이것이 진짜 현실!', '2025-01-06'),
('너, 왜 챗GPT처럼 말해?', 'https://yozm.wishket.com/magazine/detail/3344/', '{"AI","문제해결역량"}', '하드스킬', null, null, '2025-09-12'),
('‘설득하기’ 만큼 ‘설득 당하기’ 가 중요한 이유', 'https://yozm.wishket.com/magazine/detail/2262/', '{"커뮤니케이션"}', '소프트스킬', null, '적당한 채찍은 사람의 성장을 불러옵니다. 자신의 틀린 부분은 솔직하게 인정 해야해요.', '2023-10-10'),
('무신사는 왜 PC버전 서비스를 하지 않는걸까?', 'https://yozm.wishket.com/magazine/detail/2659/', '{"기획"}', '소프트스킬', null, '이래서 초기 기획 단계에서는 PC버전 모바일버전 모두 생각해야해요!', '2024-07-04'),
('기획자로서 알아야 하는 MVP 개발 방법론', 'https://yozm.wishket.com/magazine/detail/1770/', '{"기획"}', '하드스킬', null, null, '2022-11-03'),
('Top AI 피그마 플러그인 사용 후기', 'https://brunch.co.kr/@seungpillee/67?utm_source=oneoneone', '{"Figma"}', '하드스킬', null, '피그마를 이렇게 까지 사용하는 단계까지 왔네요. 와우', '2023-04-26'),
('노코드 AI 에이전트 개발의 역습과 개발자의 역할', 'https://yozm.wishket.com/magazine/detail/3179/', '{"AI"}', '하드스킬', null, null, '2025-06-16'),
('2년차 PM의 하루', 'https://brunch.co.kr/@leesy0203/5', '{"문제해결역량"}', '소프트스킬', null, '누가 내 얘기를 써놨어요', '2024-03-12'),
('이제 마케팅아니고 ‘다크패턴’ 입니다', 'https://yozm.wishket.com/magazine/detail/2398/', '{"마케팅"}', '하드스킬', null, '비즈니스 모델 설정 할 때 필요한 정보 일수 있겠는데요? 알고만 있어도 좋을 것 같아요 🙂', '2024-01-04'),
('혼자서 디자인 에이전시로 월 1억의 순수익을 버는 비전공자 디자이너', 'https://maily.so/josh/posts/1do1q6kjrx6', '{"디자인","비즈니스"}', '하드스킬', null, '말로만 하는 비지니스 말고 직접 체험해보기! (feat. 튜터 본인이 직접 생체실험을 진행중)', '2025-01-06'),
('[서비스 기획자 (PM)가 하는 일] MVP 기획과 검증', 'https://prime-career.tistory.com/entry/%EC%84%9C%EB%B9%84%EC%8A%A4-%EA%B8%B0%ED%9A%8D%EC%9E%90-PM%EA%B0%80-%ED%95%98%EB%8A%94-%EC%9D%BC-MVP-%EA%B8%B0%ED%9A%8D%EA%B3%BC-%EA%B2%80%EC%A6%9D', '{}', '소프트스킬', null, null, '2025-03-31'),
('인스타 스토리 PM이 소셜앱의 본질을 다시 설계하다', 'https://maily.so/inusystem/posts/xyowmn12z28', '{"기획"}', '하드스킬', null, null, '2025-05-24'),
('컬리의 BigQuery 도입기', 'https://helloworld.kurly.com/blog/bigquery-1/', '{"개발프로세스","데이터"}', '하드스킬', null, '데이터 파이프라인과 그 문제점을 살펴보고, 그것을 해결하기 위한 BigQuery 도입 주안점에 대해 소개g합니다. 데이터 관점의 개선 실무사례를 보실 수 있어요', '2025-01-14'),
('정말 디자이너가 PM대신 비즈니스를 리드해야 할까요? (feat. 실리콘밸리 리더 5인)', 'https://maily.so/josh/posts/32z8pplvrn4', '{"비즈니스"}', '소프트스킬', null, '주어진 이름과 정의보다 중요한 건 ‘본질’', '2025-01-06'),
('고민에 빠지는 순간 이탈하는 사용자의 심리', 'https://brunch.co.kr/@hijinnyjinny/28', '{"기획","디자인"}', '하드스킬', null, '‘유저’를 제대로 이해할 수 있는 아주 아주 기초적인 지식!', '2025-01-06'),
('PM이 꼭 알아야 할 지표와 KPIs 정리', 'https://brunch.co.kr/@mint0207b/20?fbclid=IwAR2zIzqUEnA65oZhQADD0VFAvhuzWzg3BfG8I7-gnN8BPgFgUBEULVC33yI', '{"개발프로세스","기획","데이터"}', '하드스킬', null, '추상적인 개념이 아닌 직관적인 개념과 정의', '2025-01-27'),
('팀프로젝트 성패는 PM에게 달려있다', 'https://www.dailypop.kr/news/articleView.html?idxno=81401', '{"문제해결역량"}', '소프트스킬', null, 'PM이 왜 중요한가', '2025-01-14'),
('챗GPT도 마케팅이 필요했을까?', 'https://yozm.wishket.com/magazine/detail/3238/', '{"AI"}', '하드스킬', null, null, '2025-07-15'),
('[채용공고 톺아보기] #4 서비스 기획 포폴 꿀팁?', 'https://brunch.co.kr/@13335218e68a4e8/90', '{"기획","문제해결역량"}', '소프트스킬', null, '우리가 하는 일에 대한 기본 정의와 이해
그리고 채용준비까지.', '2025-01-10'),
('PM이 개발자와 협업하는 법', 'https://app.dalpha.so/blog/pm-cowork-communication/', '{"커뮤니케이션"}', '소프트스킬', null, '다른 제목:
개발팀을 한 달만에 내편으로 만들기', '2023-11-23'),
('프로덕트 매니저(PM)가 되는 법', 'https://www.fortunekorea.co.kr/news/articleView.html?idxno=43003', '{"문제해결역량"}', '소프트스킬', null, 'PM이 되기 위한 준비.  실무 경험을 쌓을 수 있는 방법에 대해 알아봅니다.', '2025-01-14'),
('구글 클라우드 기반 기업용 AI 구축하기', 'https://yozm.wishket.com/magazine/detail/3203/', '{"문제해결역량"}', '소프트스킬', null, null, '2025-06-26'),
('스타트업 OKR 실전 팁! — 29CM PO가 OKR을 쓰는 법', 'https://medium.com/29cm/%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85-okr-%EC%8B%A4%EC%A0%84-%ED%8C%81-96e447eda690', '{"문제해결역량"}', '하드스킬', null, null, null),
('하나의 가설로 극한의 성과물 | 당근 블로그', 'https://about.daangn.com/blog/archive/%EB%8B%B9%EA%B7%BC-%ED%94%84%EB%A1%9C%EB%8D%95%ED%8A%B8%EB%94%94%EC%9E%90%EC%9D%B4%EB%84%88-%EC%B1%84%EC%9A%A9-%EC%9D%B8%ED%84%B0%EB%B7%B0/', '{"문제해결역량"}', '하드스킬', null, null, null),
('고민보다 실행하라, 성장 궤도를 달리는 중고차 직거래 | 당근 블로그', 'https://about.daangn.com/blog/archive/%EB%8B%B9%EA%B7%BC-%EC%A4%91%EA%B3%A0%EC%B0%A8-%EC%A7%81%EA%B1%B0%EB%9E%98-%EC%8B%A4%ED%97%98%EB%AC%B8%ED%99%94-%EC%82%AC%EC%9A%A9%EC%9E%90%EA%B2%BD%ED%97%98-%ED%8C%80%EB%AC%B8%ED%99%94/', '{"문제해결역량"}', '하드스킬', null, null, null),
('무인양품앱 UI/UX 컨설팅', 'https://yozm.wishket.com/magazine/detail/1103/', '{"UI/UX","디자인"}', '하드스킬', null, null, null),
('바인더마켓 ''매너온도'' 글로벌 수출기 (1)-사용자 조사로 사용자의 음성 듣기', 'https://medium.com/daangn/%EA%B8%80%EB%A1%9C%EB%B2%8C-%EC%9C%A0%EC%A0%80%EB%A5%BC-%EC%9C%84%ED%95%9C-%EB%A7%A4%EB%84%88%EC%98%A8%EB%8F%84-%EB%A7%8C%EB%93%A4%EA%B8%B0-1-%EC%82%AC%EC%9A%A9%EC%9E%90%EC%A1%B0%EC%82%AC%EB%A1%9C-%EC%9C%A0%EC%A0%80%EC%9D%98-%EB%AA%A9%EC%86%8C%EB%A6%AC-%EB%93%A3%EA%B8%B0-4d90cb46553e', '{"비즈니스"}', '하드스킬', null, null, null),
('UX 리서처로의 시작과 성장: UX 리서치 파트너 이야기', 'https://toss.tech/article/ux-research-partner-2', '{"UI/UX","디자인"}', '하드스킬', null, null, null),
('푸시 클릭률 6배를 만든 고객집중 | 29CM', 'https://medium.com/29cm/%ED%91%B8%EC%8B%9C-%ED%81%B4%EB%A6%AD%EC%9C%A8-6%EB%B0%B0%EB%A5%BC-%EB%A7%8C%EB%93%A0-%EA%B3%A0%EA%B0%9D%EC%A7%91%EC%A4%91-2811bf0a15c7', '{"문제해결역량"}', '하드스킬', null, null, null)
on conflict (url) do nothing;
