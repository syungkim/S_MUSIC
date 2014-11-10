(function(win,doc,$, _, undefined){
    "use strict";

    var S_MUSIC = S_MUSIC || {};


    S_MUSIC.searchVideo = function (_str, callback) {

        $.ajax({
            url : 'https://www.googleapis.com/youtube/v3/search',
            cache: false,
            data : {
                part : 'snippet',
                maxResults : 30,
                type : 'video',
                videoSyndicated : true,
                order : 'relevance',
                q : _str,
                key : 'AIzaSyAzXin1NLQY528UIspoYjHxD5n0bxeCYWY'
            },
            success : function (data) {
                var _template,
                    dataList = {};
                dataList.keyword = _str;
                dataList.itemList = [];

                $.each(data.items, function(index, item){
                    dataList.itemList[index] = {
                        'id' : item.id.videoId,
                        'thumURL' : item.snippet.thumbnails.medium.url,
                        'title' : item.snippet.title
                    };
                });

                callback && callback(dataList);
            }
        });
    };


    $('#search-confirm').on('click',function(e){
        e.preventDefault();
        S_MUSIC.searchVideo( $('#search-txt').val() , S_MUSIC.VIEW.makeSearchList );
    });


    win.S_MUSIC = S_MUSIC;
})(this, this.document, jQuery, _);
