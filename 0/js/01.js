(function(win,doc,$, _, undefined){
    "use strict";
    var S_MUSIC = S_MUSIC || {};


    //CONSTANT
    var __TEMPLATE_PATH = './template/';

    S_MUSIC.state = {
        PROGRESS_TIMER : null
    };


    /***********************
     * 검색
     ***********************/
    S_MUSIC.search = S_MUSIC.search || {};
    S_MUSIC.search.youtube = function (sSearchValue, callback) {

        $.ajax({
            url : 'https://www.googleapis.com/youtube/v3/search',
            cache: false,
            data : {
                part : 'snippet',
                maxResults : 30,
                type : 'video',
                videoSyndicated : true,
                order : 'relevance',
                q : sSearchValue,
                key : 'AIzaSyAzXin1NLQY528UIspoYjHxD5n0bxeCYWY'
            },
            success : function (data) {
                var _template,
                    dataList = {};
                dataList.keyword = sSearchValue;
                dataList.itemList = [];

                $.each(data.items, function(index, item){
                    dataList.itemList[index] = {
                        'id' : item.id.videoId,
                        'title' : item.snippet.title
                    };
                });

                callback && callback(dataList);
            }
        });
    };

    S_MUSIC.search.makeList = function(oList){
        if(oList){
            makeDataToHTML( __TEMPLATE_PATH +'searchlist.mst', oList, '#searchList');
            modeTransition('#searchList');
        }
    };


    /**
     * PLAYER
     */
    S_MUSIC.player = {};
    S_MUSIC.player.el = {
        tube : null,
        stage : $('#stage'),
        progress : $('#progress'),
        progressCurrent : $('#progress-current'),
        progressTotal : $('#progress-total'),
        play : $('#play'),
        pause : $('#pause'),
        repeat : $('#repeat'),
        suffle : $('#suffle'),
        loading : $('#loading')
    };

    //현재 곡 정보
    S_MUSIC.player.info = {
        artist : '',
        song : '',
        songID : '',
        albumID : '',
        albumImg : '',
        playTotalTime : 0
    };

    S_MUSIC.player.setMusic = function (sVideoid){
        var _el = S_MUSIC.player.el;
        if(_el.tube) _el.tube.destroy();

        var stageWidth = _el.stage.width();

        _el.tube = new YT.Player('video', {
            width : stageWidth,
            height : stageWidth / 100 * 56.25,
            playerVars: {
                autoplay: 1,
                controls : 0,
                showinfo : 0,
                rel : 0
            },
            videoId: sVideoid,
            events: {
                onReady: S_MUSIC.player.ready,
                onStateChange: S_MUSIC.player.stateChange
            }
        });
    };


    S_MUSIC.player.ready = function(){

        if(S_MUSIC.player.el.tube) {
            var _player = S_MUSIC.player,
                _tube = S_MUSIC.player.el.tube;
            _tube.setVolume( $('#volume').val() );
            _tube.setPlaybackQuality('large');

            _player.info.playTotalTime = _tube.getDuration() || 0;
            _player.el.progressCurrent.text( '0:00' );
            _player.el.progressTotal.text( _player.convertTime( _player.info.playTotalTime ) );

        }
    };

    S_MUSIC.player.stateChange = function(){
        if(S_MUSIC.player.el.tube) {
            var stateCode = S_MUSIC.player.el.tube.getPlayerState();
            var _el = S_MUSIC.player.el;
            if(stateCode === 0){
                S_MUSIC.playMoveTarget(__INDEX +1);
                _el.loading.removeClass('stop');
                _el.play.show();
                _el.pause.hide();
                clearInterval(PROGRESS_TIMER);

            } else if(stateCode === 1){
                //playing
                _el.loading.addClass('stop');
                _el.play.hide();
                _el.pause.show();
                PROGRESS_TIMER = setInterval(S_MUSIC.player.setProgress,1000);

            } else if(stateCode === 2){
                //pause
                _el.play.show();
                _el.pause.hide();
                clearInterval(PROGRESS_TIMER);

            } else if(stateCode === 3){
                //buffering
                _el.loading.removeClass('stop');
                clearInterval(PROGRESS_TIMER);
            }
        }
    };

    S_MUSIC.player.show = function(){

    };

    S_MUSIC.player.hide = function(){

    };

    S_MUSIC.player.play = function(){
        if(PLAYER) PLAYER.playVideo();
    };

    S_MUSIC.player.pause = function(){
        if(PLAYER) PLAYER.pauseVideo();
    };

    S_MUSIC.player.next = function(){
        S_MUSIC.playMoveTarget(__INDEX +1, true);
    };

    S_MUSIC.player.prev = function(){
        S_MUSIC.playMoveTarget(__INDEX -1, true);
    };

    S_MUSIC.player.repeat = function(){
        if (PLAYER_STATE.repeat_one){
            PLAYER_STATE.repeat_one = false;
            S_MUSIC.player.el.repeat.addClass('off');
        } else {
            PLAYER_STATE.repeat_one = true;
            S_MUSIC.player.el.repeat.removeClass('off');
        }
    };

    S_MUSIC.player.suffle = function(){
        if(PLAYER_STATE.suffle){
            PLAYER_STATE.suffle = false;
            S_MUSIC.player.el.suffle.addClass('off');
        } else{
            PLAYER_STATE.suffle = true;
            S_MUSIC.player.el.suffle.removeClass('off');
        }
    };

    S_MUSIC.player.volume = function(){
        if(PLAYER) PLAYER.setVolume(this.value);
        /**
         * Todo
         * 볼륨 창 변화가 있을때 시간 연장 시켜야 함
         */
    };

    S_MUSIC.player.seekTo = function(){
        if(PLAYER) PLAYER.seekTo( S_MUSIC.player.info.playTotalTime / 100 * this.value );
    };

    S_MUSIC.player.convertTime = function(timeStr){
        var min = Math.floor(timeStr / 60),
            sec = (Math.round(timeStr % 60) < 10) ? '0'+(Math.round(timeStr % 60)) : Math.round(timeStr % 60);
        return min + ':' + sec;
    };

    S_MUSIC.player.setProgress = function(){
        if(PLAYER){
            var currentTime = PLAYER.getCurrentTime && PLAYER.getCurrentTime() || 0;

            S_MUSIC.player.el.progressCurrent.text( S_MUSIC.player.convertTime( currentTime ) );
            S_MUSIC.player.el.progress.val( parseInt( currentTime / S_MUSIC.player.info.playTotalTime * 100),10);
        }
    };

    S_MUSIC.player.notification = function(artist,song,albumImg){
        if("Notification" in window){
            var winNotifi = window.Notification;

            artist = artist || '';
            song = song || '';
            albumImg = albumImg || '';

            if(winNotifi.permission === 'granted'){
                var notiObj = new Notification('S MUSIC',{
                    body : artist+' - '+song,
                    icon : albumImg
                });

                setTimeout(function(){
                    notiObj.close();
                },2000);

            }
        }
    };

    S_MUSIC.player.resize = function(){
        var videoWidth = $('#stage').width(),
            videoHeight = parseInt( videoWidth / 100 * 56.25, 10);

        $('#video').attr({
            'width' : videoWidth,
            'height' : videoHeight
        })
    };



    /**
     * 유틸리티
     */
    //템플릿과 데이터를 결합해서 돔으로 리턴
    function makeDataToHTML(tplFilePath, oData, sTargetDom){
        "use strict";
        $.get(tplFilePath, function(template) {
            var rendered = Mustache.render(template, oData);
            $(sTargetDom).html(rendered);
        });
    }

    //화면전환
    function modeTransition(sTarget){
        "use strict";
        $('.mod-list').fadeOut(300);
        $(sTarget).fadeIn(300);
    }

    /**
     * 이벤트 바인딩
     */
    //검색창
    $('#search-txt').on('keydown',function(e){
        if(e.keyCode == 13) $('#search-btn').click();
    });
    //검색버튼
    $('#search-btn').on('click',function(e){
        e.preventDefault();
        var $input = $('#search-txt'),
            _str = $input.val();
        if(_str.length){
            S_MUSIC.search.youtube(_str, S_MUSIC.search.makeList );
        } else {
            alert('검색어를 입력하세요');
            $input.focus();
        }
    });

    //목록에서 선택한 타겟을 바로 재생
    $(doc).on('click','.js-playnow',function(e){
        e.preventDefault();
        S_MUSIC.player.setMusic($(this).closest('li').data('id'));
    });

    win.S_MUSIC = S_MUSIC;

})(window, document, jQuery, _);

