# VerseLink Finder

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>성경 구절 → 유튜브 링크 변환기</title>
    
    <!-- Google Fonts & Font Awesome -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans KR', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            width: 100%;
            background: white;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        h1 i {
            color: #e74c3c;
        }

        .subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .channel-badge {
            display: inline-block;
            background: #ff0000;
            color: white;
            padding: 2px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            margin-left: 8px;
        }

        /* 입력 박스 */
        .input-section {
            margin-bottom: 30px;
        }

        .input-section label {
            display: block;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 15px;
        }

        .input-section textarea {
            width: 100%;
            height: 180px;
            padding: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-size: 15px;
            font-family: 'Noto Sans KR', sans-serif;
            resize: vertical;
            transition: border-color 0.3s;
            background: #fafafa;
        }

        .input-section textarea:focus {
            outline: none;
            border-color: #3498db;
            background: white;
            box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 16px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 32px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-family: 'Noto Sans KR', sans-serif;
        }

        .btn-primary {
            background: #3498db;
            color: white;
        }

        .btn-primary:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .btn-secondary {
            background: #ecf0f1;
            color: #2c3e50;
        }

        .btn-secondary:hover {
            background: #dde1e3;
        }

        .btn-success {
            background: #27ae60;
            color: white;
        }

        .btn-success:hover {
            background: #229954;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
        }

        /* 예시 텍스트 */
        .example-box {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 12px 0 4px 0;
            font-size: 14px;
            color: #555;
            cursor: pointer;
            transition: background 0.2s;
        }

        .example-box:hover {
            background: #eef2f7;
        }

        .example-box strong {
            color: #2c3e50;
        }

        /* 로딩 */
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
        }

        .loading.active {
            display: block;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* 결과 카드 */
        .results {
            display: none;
            margin-top: 30px;
            border-top: 2px solid #ecf0f1;
            padding-top: 30px;
        }

        .results.active {
            display: block;
        }

        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .results-header h2 {
            font-size: 20px;
            color: #2c3e50;
        }

        .results-header .badge {
            background: #3498db;
            color: white;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
        }

        .card-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .card {
            background: #fafafa;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e8e8e8;
            transition: all 0.3s;
            cursor: pointer;
        }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border-color: #3498db;
        }

        .card .passage {
            font-weight: 700;
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 4px;
        }

        .card .passage i {
            color: #e74c3c;
            margin-right: 6px;
        }

        .card .link {
            color: #3498db;
            font-size: 14px;
            word-break: break-all;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .card .link i {
            font-size: 12px;
        }

        .card .thumbnail-placeholder {
            margin-top: 12px;
            background: #e8e8e8;
            border-radius: 8px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #95a5a6;
            font-size: 14px;
            background: linear-gradient(135deg, #e8e8e8 0%, #d5d5d5 100%);
        }

        .card .thumbnail-placeholder i {
            font-size: 32px;
            margin-right: 8px;
        }

        .card .video-wrapper {
            margin-top: 12px;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            background: #000;
        }

        .card .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

        .card .no-video {
            color: #e67e22;
            font-size: 14px;
            margin-top: 8px;
        }

        /* 에러 메시지 */
        .error-message {
            background: #fee;
            color: #c0392b;
            padding: 12px 16px;
            border-radius: 12px;
            border-left: 4px solid #c0392b;
            margin-top: 12px;
            display: none;
        }

        .error-message.active {
            display: block;
        }

        /* 반응형 */
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 22px;
            }

            .btn {
                padding: 10px 20px;
                font-size: 14px;
            }

            .card {
                padding: 16px;
            }
        }
    






    


        
        말씀 → 유튜브 링크
        @PRS</span>
    
    


         '읽을 말씀'이 포함된 텍스트를 붙여넣으면 
        @PRS</strong> 채널에서 자동으로 유튜브 영상을 찾아드려요
    





    
    


        
             텍스트 붙여넣기
        
        

        
        


             예시 텍스트 불러오기 — 클릭하면 위 입력창에 샘플이 채워져요
        



        


            
                 유튜브 검색하기
            
            
                 모두 지우기
            
        



        


            
            오류가 발생했어요.
        


    



    
    


        


        

🔍 @PRS</strong> 채널에서 영상을 찾는 중이에요... 잠시만 기다려주세요!




    

    
    


        


            

 검색 결과


            0개
        


        


            
        


    @PRS)
    const CHANNEL_HANDLE = '@PRS';

    // =====================================================
    // 2. DOM 요소
    // =====================================================
    
    const inputText = document.getElementById('inputText');
    const processBtn = document.getElementById('processBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const cardGrid = document.getElementById('cardGrid');
    const resultCount = document.getElementById('resultCount');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // =====================================================
    // 3. 예시 텍스트 불러오기
    // =====================================================
    
    function loadExample() {
        inputText.value = `📖 읽을 말씀
    - 창세기 1장 1-5절
    - 마태복음 5장 3-10절
    - 시편 23편 1-6절
    - 요한복음 3장 16절`;
        hideError();
    }

    // =====================================================
    // 4. 성경 구절 추출 (파싱)
    // =====================================================
    
    function extractPassages(text) {
        const lines = text.split('\n');
        const passages = [];
        
        // 정규표현식: 한글 책 이름 + 숫자(장) + 숫자(절) 패턴
        const regex = /([가-힣]+)\s*(\d+)\s*[장편]?\s*(\d+)\s*[-~]?\s*(\d+)?\s*절?/;
        
        for (let line of lines) {
            if (line.includes('읽을 말씀')) {
                continue;
            }
            
            const match = line.match(regex);
            if (match) {
                const book = match[1];
                const chapter = match[2];
                const startVerse = match[3];
                const endVerse = match[4] || startVerse;
                
                let passageStr = `${book} ${chapter}장 ${startVerse}`;
                if (endVerse !== startVerse) {
                    passageStr += `-${endVerse}`;
                }
                passageStr += '절';
                
                passages.push({
                    book: book,
                    chapter: chapter,
                    startVerse: startVerse,
                    endVerse: endVerse,
                    display: passageStr
                });
            }
        }
        
        return passages;
    }

    // =====================================================
    // 5. 채널 핸들로 채널 ID 가져오기
    // =====================================================
    
    async function getChannelId(handle) {
        // 핸들에서 @ 제거
        const cleanHandle = handle.replace('@', '');
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${cleanHandle}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return data.items[0].snippet.channelId;
            } else {
                return null;
            }
        } catch (error) {
            console.error('채널 ID 조회 오류:', error);
            return null;
        }
    }

    // =====================================================
    // 6. YouTube 검색 (채널 ID 사용)
    // =====================================================
    
    async function searchYouTube(passage, channelId) {
        const query = `${passage.display} 공동체성경읽기`;
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&channelId=${channelId}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                return {
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    title: data.items[0].snippet.title,
                    thumbnail: data.items[0].snippet.thumbnails.medium.url,
                    found: true
                };
            } else {
                return {
                    found: false,
                    url: null,
                    embedUrl: null,
                    title: null,
                    thumbnail: null
                };
            }
        } catch (error) {
            console.error('YouTube API 오류:', error);
            return {
                found: false,
                url: null,
                embedUrl: null,
                title: null,
                thumbnail: null,
                error: error.message
            };
        }
    }

    // =====================================================
    // 7. 메인 처리 함수
    // =====================================================
    
    async function processText() {
        // 초기화
        hideError();
        results.classList.remove('active');
        cardGrid.innerHTML = '';
        loading.classList.add('active');
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 검색 중...';
        
        try {
            const text = inputText.value.trim();
            
            if (!text) {
                showError('텍스트를 입력해주세요!');
                return;
            }
            
            // 1) 성경 구절 추출
            const passages = extractPassages(text);
            
            if (passages.length === 0) {
                showError('"읽을 말씀"이 포함된 성경 구절을 찾을 수 없어요. 형식을 확인해주세요.');
                return;
            }
            
            if (passages.length > 4) {
                showError(`4개 이상의 구절이 감지되었어요 (${passages.length}개). 처음 4개만 처리합니다.`);
                passages.splice(4);
            }
            
            // 2) YouTube API 키 확인
            if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
                showError('YouTube API 키가 설정되지 않았어요! 코드 상단의 YOUTUBE_API_KEY를 입력해주세요.');
                return;
            }
            
            // 3) 채널 핸들(@PRS)로 채널 ID 조회
            const channelId = await getChannelId(CHANNEL_HANDLE);
            
            if (!channelId) {
                showError(`"${CHANNEL_HANDLE}" 채널을 찾을 수 없어요. 채널 핸들을 확인해주세요.`);
                return;
            }
            
            console.log(`✅ 채널 ID 찾음: ${channelId}`);
            
            // 4) 각 구절을 YouTube에서 검색 (병렬 처리)
            const searchPromises = passages.map(p => searchYouTube(p, channelId));
            const resultsData = await Promise.all(searchPromises);
            
            // 5) 결과 표시
            displayResults(passages, resultsData);
            
        } catch (error) {
            console.error('처리 중 오류:', error);
            showError(`처리 중 오류가 발생했어요: ${error.message}`);
        } finally {
            loading.classList.remove('active');
            processBtn.disabled = false;
            processBtn.innerHTML = ' 유튜브 검색하기';
        }
    }

    // =====================================================
    // 8. 결과 표시
    // =====================================================
    
    function displayResults(passages, resultsData) {
        cardGrid.innerHTML = '';
        
        let foundCount = 0;
        
        passages.forEach((passage, index) => {
            const data = resultsData[index];
            const card = document.createElement('div');
            card.className = 'card';
            
            let content = `
                


                     ${passage.display}
                


            `;
            
            if (data && data.found) {
                foundCount++;
                content += `
                    


                         
                        ${data.url}
                    


                    


                        
                    


                `;
            } else {
                content += `
                    


                         
                        @PRS 채널에서 영상을 찾을 수 없어요 😢
                        ${data && data.error ? `
(${data.error})` : ''}
                    
                `;
            }
            
            card.innerHTML = content;
            
            if (data && data.found) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    window.open(data.url, '_blank');
                });
            }
            
            cardGrid.appendChild(card);
        });
        
        resultCount.textContent = `${foundCount}/${passages.length}개 발견`;
        results.classList.add('active');
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // =====================================================
    // 9. 유틸리티 함수
    // =====================================================
    
    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.classList.add('active');
    }
    
    function hideError() {
        errorMessage.classList.remove('active');
    }
    
    function clearAll() {
        inputText.value = '';
        results.classList.remove('active');
        cardGrid.innerHTML = '';
        hideError();
        loading.classList.remove('active');
        processBtn.disabled = false;
        processBtn.innerHTML = ' 유튜브 검색하기';
    }
    
    // =====================================================
    // 10. 키보드 단축키 (Ctrl+Enter)
    // =====================================================
    
    inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            processText();
        }
    });

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d28ea1ef-ea15-49a3-81c5-dda83b3ffb18).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
