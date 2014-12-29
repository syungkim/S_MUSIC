(function($, window, undefined){
	"use strict";

	var PLAYER,
        PROGRESS_TIMER,
        PLAYER_STATE = {
            playing : false,
			repeat_one  : false,
			suffle : false
		},
		__INDEX = 0,
        isAndroid = (/android/i).test(navigator.userAgent);

	/**
	 * Namespace S_MUSIC
	 * @type {{}}
	 */
	var S_MUSIC = {};

    S_MUSIC.genre = function(){
      var genre = window.location.hash || '#kpop',
          $genre = $('#genre');

        $genre.find('[href='+genre+']').addClass('active').siblings().removeClass('active');
        S_MUSIC.getPlayList(genre);
    };
	/**
	 * 멜론에 플레이 목록 요청
	 * @name requestPlayList
	 * @param scope {string}
	 */
	S_MUSIC.getPlayList = function(scope){
        var genre = (scope === '#pop') ? 'DP0200' : 'DP0100';

        // DP0100 : 가요, DP0200 : pop
        $.ajax({
            dataType : 'json',
            //url : 'http://apis.skplanetx.com/melon/charts/topgenres/'+genre,
            url : 'http://apis.skplanetx.com/melon/charts/todaytopsongs',
            data : {
                version : 1,
                page : 1,
                count : 100,
                appKey : '903d0499-d8d5-3264-a83f-e42492bff6d3'
            },
            success : function(data){
                S_MUSIC.makePlayList( S_MUSIC.filterPlayList( data.melon.songs.song ) );
            }
        })
	};

	/**
	 * 멜론데이터에서 필요한 데이터만 필터링
	 * @name filterPlayList
	 * @param originList
	 * @returns {Array}
	 */
	S_MUSIC.filterPlayList = function ( originList ){
		var filteredPlayList = [];

		$.each( originList ,function(songIndex){
			var data = originList[songIndex],
				tmpArtist = [],
				tmpSong, tmpAlbumID;

			$.each( data.artists.artist , function( artistIndex ){
				tmpArtist.push( data.artists.artist[artistIndex].artistName );
			});
			tmpArtist = tmpArtist.join(' & ');
			tmpSong = data.songName;
            tmpAlbumID = data.albumId;

			filteredPlayList.push({
				artist : tmpArtist,
				song : tmpSong,
                songId : data.songId,
                albumID : tmpAlbumID
			});
		});

		return filteredPlayList
	};

	/**
	 * 플레이 리스트 DOM 생성
	 * @name makePlayList
	 * @param playList
	 */
	S_MUSIC.makePlayList = function( playList ){
		var _html = [];
		_html.push('<ul class="item-list">');
		$.each(playList, function(index){
			_html.push('<li class="item"><a href="#" data-album="'+playList[index].albumID+'"data-id="'+playList[index].songId+'" data-song="'+playList[index].song+'" data-artist="'+playList[index].artist+'">#'+ (index+1) +'. '+ playList[index].song+' - '+playList[index].artist+'</a></li>');
		});
		_html.push('</ul>');
		_html = _html.join('');
		$('#list_inner').html(_html);
	};


	/**
	 * 유튜브에서 영상ID검색
	 * @name getYoutubeID
	 * @param songName {string}
	 * @param artist {string}
	 */
	S_MUSIC.getYoutubeID = function(songName , artist){
        var searchStartDate = new Date();
        searchStartDate.setMonth(searchStartDate.getMonth() - 6);
        searchStartDate = searchStartDate.toISOString();

		$.ajax({
			url : 'https://www.googleapis.com/youtube/v3/search',
            cache: false,
			data : {
                part : 'id',
                maxResults : 1,
                type : 'video',
                order : 'relevance',
                q : songName + ' - ' + artist,
                //publishedAfter : searchStartDate,
                videoSyndicated : true,
                videoEmbeddable : true,
                key : 'AIzaSyAzXin1NLQY528UIspoYjHxD5n0bxeCYWY'
			},
			success : function(youtube){
				S_MUSIC.setMusicToPlayer( youtube.items[0].id.videoId );
                document.title = songName + ' - ' + artist;
			}
		})
	};

    /**
     * 선택된 곡 플레이어 추가
     * @name setMusicToPlayer
     * @param uTubeVideoID {string}
     */
	S_MUSIC.setMusicToPlayer = function(uTubeVideoID){
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
            videoId: uTubeVideoID,
            events: {
                onReady: S_MUSIC.player.ready,
                onStateChange: S_MUSIC.player.stateChange
            }
        });
	};

    /**
     * 다음 곡 index 플레이 실행
     * @name playMoveTarget
     * @param playIndex {number}
     */
	S_MUSIC.playMoveTarget = function(playIndex, targetForce){
        targetForce = targetForce || false;

		if(playIndex < 0){
			playIndex = 99;
		}
		if(playIndex >= 100){
			playIndex = 0;
		}

		if(!targetForce && PLAYER_STATE.repeat_one) playIndex = __INDEX;
		if(PLAYER_STATE.suffle) playIndex = Math.floor(Math.random() * 100);

		$('#list_inner').find('li').eq(playIndex).find('a').click();
	};

    /**
     * _YQL
     * @param query
     * @param callback
     */
    S_MUSIC._yql = function(query, callback) {
        if (!query || !callback) {
            throw new Error('$.YQL(): Parameters may be undefined');
        }
        var encodedQuery = encodeURIComponent(query.toLowerCase()),
            url = 'http://query.yahooapis.com/v1/public/yql?q='+ encodedQuery;

        $.ajax({
            url: url,
            success: callback,
            dataType: 'xml'
        });
    };
    /**
     * lyric
     * 가사 요청 후 출력
     * @param songId
     */
    S_MUSIC.lyric = function(songId){
        S_MUSIC._yql("select * from html where url='http://www.melon.com/song/detail.htm?songId="+songId+"' AND xpath='//*[@id=\"d_video_summary\"]' ", function(xml) {
            var result = $(xml).find('#d_video_summary').html();
            $('#lyric').html(result);
        });
    };

	/**
	 * 앨범이미지 크롤링
	 * @param albumID
	 */
    S_MUSIC.getAlbumImg = function(albumID){
        S_MUSIC._yql("select * from html where url='http://www.melon.com/album/detail.htm?albumId="+albumID+"' AND xpath='//*[@id=\"conts\"]'", function(xml) {
            var $thum = $(xml).find('.wrap_thumb'),
                txt = $thum.find('img').attr('alt');

	        S_MUSIC.player.info.albumImg = $thum.find('#albumImgArea img').attr('src');
	        S_MUSIC.player.notification( S_MUSIC.player.info.artist , S_MUSIC.player.info.song, S_MUSIC.player.info.albumImg );
        });
    };


	/**
	 * PLAYER
	 */
	S_MUSIC.player = {};
	S_MUSIC.player.el = {
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

    S_MUSIC.player.ready = function(){
        if(PLAYER) {
	        var _player = S_MUSIC.player;
            PLAYER.setVolume( $('#volume').val() );
	        PLAYER.setPlaybackQuality('large');
            _player.resize();
	        _player.info.playTotalTime = PLAYER.getDuration() || 0;
	        _player.el.progressCurrent.text( '0:00' );
	        _player.el.progressTotal.text( _player.convertTime( _player.info.playTotalTime ) );

            if(isAndroid) S_MUSIC.player.play();
        }
    };

    S_MUSIC.player.stateChange = function(){
        if(PLAYER) {
            var stateCode = PLAYER.getPlayerState();
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
                if(isAndroid) S_MUSIC.player.play();
            }
        }
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


	$(function(){
		var _player = S_MUSIC.player;
        S_MUSIC.genre();
		$('#play').on('click',_player.play);
		$('#pause').on('click',_player.pause);
		$('#prev').on('click',_player.prev);
		$('#next').on('click',_player.next);
		$('#repeat').on('click',_player.repeat);
		$('#suffle').on('click',_player.suffle);
        $('#volume-control').on('click',function(){
            $('#dialog').toggle();

        });
		$('#volume').on('change',_player.volume);
		$('#progress').on('change',_player.seekTo);
        $('#list-toggle').on('click',function(){
            $(this).toggleClass('off');
            $('#l-wrap').toggleClass('on--list');
        });
        $('#video-toggle').on('click',function(){
            $(this).toggleClass('off');
            $('#l-wrap').toggleClass('on--video');
        });
        $('#lyric-toggle').on('click',function(){
            $(this).toggleClass('off');
            $('#l-wrap').toggleClass('on--lyric');
        });
		$('#list_inner').on('click','a',function(e){
			e.preventDefault();
			var $this = $(this);
			var _info = _player.info;
            var $self = $this.closest('li');

			__INDEX = $self.index();

			_info.artist = $this.data('artist');
			_info.song = $this.data('song');
			_info.songID = $this.data('id');
			_info.albumID = $this.data('album');

			S_MUSIC.getYoutubeID( _info.song , _info.artist );
            S_MUSIC.lyric( _info.songID );
            S_MUSIC.getAlbumImg( _info.albumID );
			$('#display-info').text( $this.text() );
            $self.addClass('active').siblings().removeClass('active');
		});

        if(isAndroid){
            $('#video-toggle').click();
            $('#lyric-toggle').click();
        }
	});

    $(window).load(function(){
        if ("onhashchange" in window) {
            window.addEventListener('hashchange',function(){
                S_MUSIC.genre();
            })
        }

	    if (window.Notification && Notification.permission !== "granted") {
		    Notification.requestPermission(function (status) {
			    if (Notification.permission !== status) {
				    Notification.permission = status;
			    }
		    });
	    }

        setTimeout(function(){
            S_MUSIC.playMoveTarget(0);
        },1000)

    }).resize(function(){
        S_MUSIC.player.resize();
    }).resize();

})(jQuery, window, undefined);
