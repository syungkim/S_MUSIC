(function(win,doc,$, _, undefined){
    "use strict";
    var S_MUSIC = S_MUSIC || {};


    //CONSTANT
    var __TEMPLATE_PATH = './template/';


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
     * 플레이어
     */
    S_MUSIC.player = S_MUSIC.player || {};

    /**
     *
     * @param sVideoid
     */

    /**TODO
     *

     */
    S_MUSIC.player.setMusic = function (sVideoid){
        if(PLAYER) PLAYER.destroy();

        var stageWidth = $('#stage').width();

        PLAYER = new YT.Player('video', {
            width : stageWidth,
            height : stageWidth / 100 * 56.25,
            playerVars: {
                autoplay: 1,
                controls : 0,
                showinfo : 0,
                rel : 0
            },
            videoId: sVideoid
        });
    };

    S_MUSIC.player.play = function(){
        if(PLAYER) PLAYER.playVideo();
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
        alert($(this).closest('li').data('id'));
        S_MUSIC.player.setMusic($(this).closest('li').data('id'));
    });

    win.S_MUSIC = S_MUSIC;

})(window, document, jQuery, _);

