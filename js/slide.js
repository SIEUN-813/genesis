(function($){ // 매개변수 (Parameter)
    // 즉시표현함수는 제이쿼리 달러 사인 기호의 외부 플러그인(라이브러리)와 충돌을 피하기 위해 사용하는 함수식
    // 객체 리터럴 방식 권장
    //console.log($); 
    // 객체(object) 선언 {}: 섹션별 변수 중복을 피할 수 있다.
    /*const obj = new Object(); // 객체 생성자 방식
    obj = {}*/
    const obj = {
        init(){ // obj의 대표 메서드 (init) 만들어서 하단에 한 번에 호출하기 
            this.header();
            this.section1();
            this.section2();
            this.section3();
        },
        header(){},
        section1(){
            let cnt = 0;
            let setId = 0;
            let mouseDown = null;
            let mouseUp = null;
            let dragStart = null; // 드래그시작변수
            let dragEnd = null; // 드래그끝변수
            let mDown = false; // 마우스다운(드래그시작알림)
            let winWidth = $(window).innerWidth(); // 창너비 = 슬라이드 1개의 너비
            let sizeX = winWidth / 2; // 드래그 길이
            const slideContainer = $('#section1 .slide-container');
            const slideWrap = $('#section1 .slide-wrap');
            const slideView = $('#section1 .slide-view');
            const slideImg = $('#section1 .slide-view .slide img');
            const pageBtn = $('#section1 .page-btn');
            const stopBtn = $('#section1 .stop-btn');
            const playBtn = $('#section1 .play-btn');
            const n = ($('#section1 .slide').length - 2) - 1;  

            // 이미지 반응형 => 비율계산
            // 이미지비율 = 이미지너비(2500)
            // 1.313715187 = 2500 / 1903
            // 윈도우(창)너비 = $(window).innerWidth();
            // 이미지크기 = 창너비(반응형크기) * 이미지비율(1.313715187)

            // 1. 슬라이드 창크기에 반응하는 이미지크기 반응형 만들기
            // ? = 2560(이미지크기) / 1903(창크기) 최초의 기준비율 고정값 구하기
            const imgRate = 1.345244351;
            // 2. 이미지 translateX(-320px) 반응형 적용하기
            // ? = 320 / 이미지크기 최초의 기준비율 고정값 구하기
            const transRate = 0.125;
            // 이미지크기 width = 이미지비율 * 창넓이
            // translate(-?px)
            slideImg.css({width: imgRate * winWidth, transform:`translateX(${-(imgRate * winWidth) * transRate}px)`});
            // 여기까지는 적용하고 새로고침 할 때 이미지 크기가 변경이 되면 1차 작업 완료
            $(window).resize(function(){
                winWidth = $(window).innerWidth();
                sizeX = winWidth / 2;
                slideImg.css({width: imgRate * winWidth, transform:`translateX(${-(imgRate * winWidth) * transRate}px)`});
            });

            
            // 메인슬라이드 터치스와이프 이벤트
            // 데스크탑 (마우스) 터치 스와이프 이벤트
            // 데스크탑 (마우스) 드래그 앤 드롭
            // 마우스다운 => 터치시작
            // 마우스업 => 터치끝
            // 화면의 왼쪽 끝이 0 ~ 화면의 오른쪽 끝이 1920(화면해상도)
            slideContainer.on({
                mousedown(e){
                    winWidth = $(window).innerWidth(); // mousedown하면 창너비 가져오기 (반응형)
                    sizeX = winWidth / 2;

                    mouseDown = e.clientX;                    
                    //console.log(slideWrap.offset().left); // slide-wrap 좌측 좌표값
                    // 계속 드래그시 슬라이드박스 좌측값 설정
                    dragStart = e.clientX - (slideWrap.offset().left + winWidth);   // .slide-wrap에 margin-left: 100% 해줌 => margin-left: 100% = 1903px
                                                                                // 그래서 첫번째 슬라이드가 두번째로 선택이 되어서 +1903
                                                                                // 1903을 알아내기 위해서는 console.log(slideWrap.offset().left); 출력
                    mDown = true; // 드래그시작
                    slideView.css({cursor: 'grabbing'});
                },
                mouseup(e){
                    mouseUp = e.clientX;
                    if( mouseDown - mouseUp > sizeX) {
                        //console.log('다음슬라이드');
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')) {
                            nextCount();
                        }
                    }
                    
                    if( mouseDown - mouseUp < -sizeX) {
                        //console.log('이전슬라이드');
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')) {
                            prevCount();
                        }
                    }

                    // -sizeX 이상이고 sizeX 미만일 경우
                    if (mouseDown - mouseUp >= -sizeX && mouseDown - mouseUp <= sizeX) {
                        mainSlide(); // 슬라이드 원래대로 제자리 찾아간다
                    }
                    mDown = false; // 드래그끝을 알려주는 mouseup상태
                    slideView.css({cursor: 'grab'});
                },
                mousemove(e){
                    // 마우스다운이 없는 상태에서는 슬라이드가 따라다니지 못하게 한다.
                    // 단, 마우스업이 되면 해제
                    if (!mDown) {
                    // if (mDown !== true), if (!mDown), if (mDown === false), 같은 뜻
                    // mDown이 있어야만 드래그 가능
                        return;
                    }
                    // 드래그시작
                    // 드래그끝
                    // 이동거리(마우스무브거리) = 드래그끝.좌표값 - 드래그시작.좌표값
                    dragEnd = e.clientX
                    //console.log(dragEnd - dragStart);
                    // 메인슬라이드 이동 (드래그)
                    slideWrap.css({left: dragEnd - dragStart}); // 1px단위로 움직여서 animate로 할 필요가 없다 => .css
                }
            });

            // slideContainer 영역을 벗어나면 mouseup의 예외처리
            // 도큐먼트 예외처리
            // 위에 적은 mouseup 코드 그대로 가져오기
            $(document).on({
                mouseUp(e){
                    if(!mDown) return;
                    mouseUp = e.clientX;
                    if( mouseDown - mouseUp > sizeX) {
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')) {
                            nextCount();
                        }
                    }
                    if( mouseDown - mouseUp < -sizeX) {
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')) {
                            prevCount();
                        }
                    }
                    mDown = false; 
                    slideView.css({cursor: 'grab'});
                }
            });

            
            // 테블릿 & 모바일 (핑거링) 터치 스와이프 이벤트
            // 테블릿 & 모바일 (핑거링) 드래그 앤 드롭
            // 손가락 터치 이벤트 확인하기
            /*
            slideContainer.on({
                touchstart(e){
                    console.log(e);
                    console.log(e.originalEvent.changedTouches[0].clientX);
                },
                touchend(e){
                    console.log(e.originalEvent.changedTouches[0].clientX);
                },
                touchmove(e){
                    console.log(e.originalEvent.changedTouches[0].clientX);
                },
            });
            */
            // 테블릿과 모바일에서만 이벤트 동작
            // originalEvent: TouchEvent,
            // type: 'touchstart'
            slideContainer.on({
                touchstart(e){
                    winWidth = $(window).innerWidth(); 
                    sizeX = winWidth / 3;
                    mouseDown = e.originalEvent.changedTouches[0].clientX;                   
                    dragStart = e.originalEvent.changedTouches[0].clientX - (slideWrap.offset().left + winWidth);  
                    mDown = true; 
                    slideView.css({cursor: 'grabbing'});
                },
                touchend(e){
                    mouseUp = e.originalEvent.changedTouches[0].clientX;
                    if( mouseDown - mouseUp > sizeX) {
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')) {
                            nextCount();
                        }
                    }
                    
                    if( mouseDown - mouseUp < -sizeX) {
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')) {
                            prevCount();
                        }
                    }

                    if (mouseDown - mouseUp >= -sizeX && mouseDown - mouseUp <= sizeX) {
                        mainSlide(); 
                    }
                    mDown = false;
                    slideView.css({cursor: 'grab'});
                },
                touchmove(e){
                    if (!mDown) {
                        return;
                    }
                    dragEnd = e.originalEvent.changedTouches[0].clientX
                    slideWrap.css({left: dragEnd - dragStart}); 
                }
            });

            // 1. 메인슬라이드함수
            function mainSlide(){ 
                //console.log(cnt);
                slideWrap.stop().animate({left: `${-100 * cnt}%`}, 600, 'easeInOutExpo', function(){
                    if(cnt > n) {
                        cnt = 0;
                    }
                    if (cnt < 0) {
                        cnt = n ;
                    }
                    slideWrap.stop().animate({left: `${-100 * cnt}%`}, 0);
                });
                pageEvent();
            }
            // 2-1. 다음카운트함수
            function nextCount(){
                cnt ++;
                mainSlide();
            }
            // 2-2. 이전카운트함수
            function prevCount(){
                cnt --;
                mainSlide();
            }
            // 3. 자동타이머함수(7초간격)
            function autoTimer(){
                setId = setInterval(nextCount, 7000);
            }
            autoTimer();
            // 4. 페이지이벤트함수
            function pageEvent(){
                pageBtn.removeClass('on');
                pageBtn.eq(cnt > n ? 0 : cnt).addClass('on');
            }
            // 5. 페이지버튼클릭
            pageBtn.each(function(idx){                
                $(this).on({
                    click(e){
                        e.preventDefault();
                        cnt = idx;
                        mainSlide();
                        clearInterval(setId); // 클릭 시 일시중지
                    }
                });
            });
            // 6-1. stop 버튼 클릭이벤트 
            stopBtn.on({
                click(e){
                    e.preventDefault();
                    stopBtn.addClass('on');
                    playBtn.addClass('on');
                    clearInterval(setId); // 클릭 시 일시중지
                }
            });
            // 6-2. play 버튼 클릭이벤트 playBtn
            playBtn.on({
                click(e){
                    e.preventDefault();
                    stopBtn.removeClass('on');
                    playBtn.removeClass('on');
                    autoTimer(); // 클릭 시 7초 후에 재실행
                }
            });
        },
        section2(){
            // 0. 변수설정
            const section2container = $('#section2 .container');
            const slideContainer = $('#section2 .slide-container');
            const slideWrap = $('#section2 .slide-wrap');
            const slideView = $('#section2 .slide-view');
            const slide = $('#section2 .slide-view .slide');
            const slideH3 = $('#section2 .slide-view .slide h3');
            const slideH4 = $('#section2 .slide-view .slide h4');
            const pageBtn = $('#section2 .page-btn');
            const selectBtn = $('#section2 .select-btn');
            const subMenu = $('#section2 .sub-menu');
            const materialIcons = $('#section2 .select-btn .material-icons');
            const heightRate = 0.884545392; // 넓이에 대한 높이 비율
            let cnt = 0;
            let touchStart = null;
            let touchEnd = null;
            let dragStart = null;
            let dragEnd = null;
            let mDown = false; // 마우스다운(드래그시작알림)
            let sizeX = 100;  // 드래그 길이
            let offsetL =  slideWrap.offset().left;
            let winWidth = $(window).innerWidth();
            let slideWidth;
            //console.log(slideWrap.offset().left);

            // 컨테이너넓이
            //console.log($('#section2').innerWidth());
            // 슬라이드 1개의 넓이에 마진이 내부에 포함된 상태 = 488.3333
            //console.log((section2container.innerWidth() - 198 + 20 + 20)/3);
            resizeFn(); // 로딩시 실행
            // 함수는 명령어의 묶음
            function resizeFn(){
                winWidth = $(window).innerWidth(); // 창크기 값을 계속 보여준다
                if (winWidth <= 1642){
                    // 1280 이하에서는 슬라이드 1개만 보인다
                    // 1280 초과에서는 슬라이드 3개 보인다
                    if (winWidth > 1280){
                        slideWidth = (section2container.innerWidth() + 20 + 20)/3;
                    }
                    else {
                        slideWidth = (section2container.innerWidth() + 20 + 20)/1;
                    }
                }
                else {
                    slideWidth = (section2container.innerWidth() - 198 + (20 + 20))/3;
                }
                //let slideWidth = (section2container.innerWidth() - 198 + 20 + 20)/3;
                slideWrap.css({width: slideWidth * 10});
                slide.css({width: slideWidth, height: slideWidth * heightRate});
                slideH3.css({fontSize: slideWidth * 0.08});
                slideH4.css({fontSize: slideWidth * 0.03});
                mainSlide(); // .slide에 메인슬라이드 넓이 전달하기 위해서 호출
            }

            $(window).resize(function(){ // 가로 세로 크기가 1px이라도 변경되면 실행(반응형), 크기가 그대로면 미실행
                resizeFn();
            });


            // 데스크탑 터치스와이프 & 드래그앤드롭
            // 이벤트는 소문자
            slideContainer.on({
                mousedown(e){
                    slideView.css({ cursor: 'grabbing' });
                    mDown = true;
                    touchStart = e.clientX;
                    dragStart = e.clientX - (slideWrap.offset().left-offsetL);
                },
                mouseup(e){
                    touchEnd = e.clientX;
                    if(touchStart-touchEnd > sizeX){
                        nextCount();
                    }
                    if(touchStart-touchEnd < -sizeX){
                        prevCount();
                    }
                    mDown = false;
                    // -sizeX >= 이상이고 <= sizeX 이하이면 원래대로 제자리로 찾아간다.
                    if(touchStart-touchEnd >= -sizeX  &&  touchStart-touchEnd <= sizeX){
                        mainSlide();
                    }
                    slideView.css({ cursor: 'grab'});
                },
                mousemove(e){
                    if(!mDown) return;
                    dragEnd = e.clientX;
                    slideWrap.css({left: dragEnd - dragStart});
                }
            });

            $(document).on({
                mouseup(e){
                    // mDown = true; 상태에서 mouseup이 실행되어서 mDown = false; 변경 그러면 이미 실행을 한 것 그래서 실행 못하게 막아야한다 => return 추가
                    if(!mDown) {
                        return;
                     } // mousedown 상태에서 mouseup이 실행이 안된상태에서만 실행                    
                    touchEnd = e.clientX;
                    if(touchStart-touchEnd > sizeX){
                        nextCount();
                    }
                    if(touchStart-touchEnd < -sizeX){
                        prevCount();
                    }
                    mDown = false;
                    // -sizeX >= 이상이고 <= sizeX 이하이면 원래대로 제자리로 찾아간다.
                    if( touchStart-touchEnd >= -sizeX  &&  touchStart-touchEnd <= sizeX ){
                        mainSlide();
                    }
                    slideView.css({cursor: 'grab'});

                }
            })

            // 테블릿, 모바일 터치스와이프 & 드래그앤드롭
            // 이벤트는 소문자
            slideContainer.on({
                touchstart(e){
                    slideView.css({ cursor: 'grabbing' });
                    mDown = true;
                    touchStart = e.originalEvent.changedTouches[0].clientX;
                    dragStart = e.originalEvent.changedTouches[0].clientX - (slideWrap.offset().left-offsetL);
                },
                touchend(e){
                    touchEnd = e.originalEvent.changedTouches[0].clientX;
                    if(touchStart-touchEnd > sizeX){
                        nextCount();
                    }
                    if(touchStart-touchEnd < -sizeX){
                        prevCount();
                    }
                    mDown = false;
                    // -sizeX >= 이상이고 <= sizeX 이하이면 원래대로 제자리로 찾아간다.
                    if(touchStart-touchEnd >= -sizeX  &&  touchStart-touchEnd <= sizeX){
                        mainSlide();
                    }
                    slideView.css({ cursor: 'grab'});
                },
                touchmove(e){
                    if(!mDown) return;
                    dragEnd = e.originalEvent.changedTouches[0].clientX;
                    slideWrap.css({left: dragEnd - dragStart});
                }
            });


            // 셀렉트버튼 클릭 이벤트 => 토글이벤트
            // 셀렉트버튼 한 번 클릭하면 서브메뉴 보이고
            // 또 한 번 클릭하면 서브메뉴 숨긴다 
            selectBtn.on({
                click(e){
                    e.preventDefault();
                    subMenu.toggleClass('on'); 
                    materialIcons.toggleClass('on');                    
                }
            })

            // 1. 메인슬라이드
            mainSlide();
            function mainSlide() { // 제이쿼리에서 사용할 때
                slideWrap.stop().animate({left: -slideWidth * cnt}, 600, 'easeInOutExpo');
                                        //{left: -488.328 * cnt} 제이쿼리는 px값을 지원해서 생략가능
                pageBtnEvent();
            };
            /* 바닐라자바스크립트 사용할 때
            function mainSlide() {
                slideWrap.css({transition: `all 0.6s ease-in-out`});
                slideWrap.css({transform: `translateX(${-488.328 * cnt}px)`});
                pageBtnEvent();
            };
            */
            // 다음카운트함수
            function nextCount(){
                cnt++;
                if(cnt > 7){
                    cnt = 7
                };
                mainSlide();
            }
            // 이전카운트함수
            function prevCount(){
                cnt--;
                if(cnt < 0){
                    cnt = 0
                };
                mainSlide();
            }
            // 2. 페이지버튼클릭이벤트
            // each() 메서드
            pageBtn.each(function(idx){
                $(this).on({
                    click(e){
                        //console.log(idx);
                        e.preventDefault();
                        cnt = idx;
                        mainSlide();
                    }
                })
            });
            // 3. 페이지버튼이벤트함수
            function pageBtnEvent() {
                pageBtn.removeClass('on');
                pageBtn.eq(cnt).addClass('on');
            }
        },
        section3(){}
    } 
    obj.init();
})(jQuery); // 전달인수(Argument)

// 즉시표현함수(IIFE) === 즉시표현함수식
/*
(function(){
})();
*/