!function(e,a){"use strict";var t,o,i={playing:!1,repeat_one:!1,suffle:!1},n=0,l=/android/i.test(navigator.userAgent),r={};r.genre=function(){var t=a.location.hash||"#kpop",o=e("#genre");o.find("[href="+t+"]").addClass("active").siblings().removeClass("active"),r.getPlayList(t)},r.getPlayList=function(a){e.ajax({dataType:"json",url:"http://apis.skplanetx.com/melon/charts/todaytopsongs",data:{version:1,page:1,count:100,appKey:"903d0499-d8d5-3264-a83f-e42492bff6d3"},success:function(e){r.makePlayList(r.filterPlayList(e.melon.songs.song))}})},r.filterPlayList=function(a){var t=[];return e.each(a,function(o){var i,n,l=a[o],r=[];e.each(l.artists.artist,function(e){r.push(l.artists.artist[e].artistName)}),r=r.join(" & "),i=l.songName,n=l.albumId,t.push({artist:r,song:i,songId:l.songId,albumID:n})}),t},r.makePlayList=function(a){var t=[];t.push('<ul class="item-list">'),e.each(a,function(e){t.push('<li class="item"><a href="#" data-album="'+a[e].albumID+'"data-id="'+a[e].songId+'" data-song="'+a[e].song+'" data-artist="'+a[e].artist+'">#'+(e+1)+". "+a[e].song+" - "+a[e].artist+"</a></li>")}),t.push("</ul>"),t=t.join(""),e("#list_inner").html(t)},r.getYoutubeID=function(a,t){var o=new Date;o.setMonth(o.getMonth()-6),o=o.toISOString(),e.ajax({url:"https://www.googleapis.com/youtube/v3/search",cache:!1,data:{part:"id",maxResults:1,type:"video",videoSyndicated:!0,order:"relevance",q:a+" - "+t,publishedAfter:o,key:"AIzaSyAzXin1NLQY528UIspoYjHxD5n0bxeCYWY"},success:function(e){r.setMusicToPlayer(e.items[0].id.videoId),document.title=a+" - "+t}})},r.setMusicToPlayer=function(a){t&&t.destroy();var o=e("#stage").width();t=new YT.Player("video",{width:o,height:o/100*56.25,playerVars:{autoplay:1,controls:0,showinfo:0,rel:0},videoId:a,events:{onReady:r.player.ready,onStateChange:r.player.stateChange}})},r.playMoveTarget=function(a,t){t=t||!1,0>a&&(a=99),a>=100&&(a=0),!t&&i.repeat_one&&(a=n),i.suffle&&(a=Math.floor(100*Math.random())),e("#list_inner").find("li").eq(a).find("a").click()},r._yql=function(a,t){if(!a||!t)throw new Error("$.YQL(): Parameters may be undefined");var o=encodeURIComponent(a.toLowerCase()),i="http://query.yahooapis.com/v1/public/yql?q="+o;e.ajax({url:i,success:t,dataType:"xml"})},r.lyric=function(a){r._yql("select * from html where url='http://www.melon.com/song/detail.htm?songId="+a+"' AND xpath='//*[@id=\"d_video_summary\"]' ",function(a){var t=e(a).find("#d_video_summary").html();e("#lyric").html(t)})},r.getAlbumImg=function(a){r._yql("select * from html where url='http://www.melon.com/album/detail.htm?albumId="+a+"' AND xpath='//*[@id=\"conts\"]'",function(a){{var t=e(a).find(".wrap_thumb");t.find("img").attr("alt")}r.player.info.albumImg=t.find("#albumImgArea img").attr("src"),r.player.notification(r.player.info.artist,r.player.info.song,r.player.info.albumImg)})},r.player={},r.player.el={progress:e("#progress"),progressCurrent:e("#progress-current"),progressTotal:e("#progress-total"),play:e("#play"),pause:e("#pause"),repeat:e("#repeat"),suffle:e("#suffle"),loading:e("#loading")},r.player.info={artist:"",song:"",songID:"",albumID:"",albumImg:"",playTotalTime:0},r.player.ready=function(){if(t){var a=r.player;t.setVolume(e("#volume").val()),t.setPlaybackQuality("large"),a.resize(),a.info.playTotalTime=t.getDuration()||0,a.el.progressCurrent.text("0:00"),a.el.progressTotal.text(a.convertTime(a.info.playTotalTime)),l&&r.player.play()}},r.player.stateChange=function(){if(t){var e=t.getPlayerState(),a=r.player.el;0===e?(r.playMoveTarget(n+1),a.loading.removeClass("stop"),a.play.show(),a.pause.hide(),clearInterval(o)):1===e?(a.loading.addClass("stop"),a.play.hide(),a.pause.show(),o=setInterval(r.player.setProgress,1e3)):2===e?(a.play.show(),a.pause.hide(),clearInterval(o)):3===e&&(a.loading.removeClass("stop"),clearInterval(o),l&&r.player.play())}},r.player.play=function(){t&&t.playVideo()},r.player.pause=function(){t&&t.pauseVideo()},r.player.next=function(){r.playMoveTarget(n+1,!0)},r.player.prev=function(){r.playMoveTarget(n-1,!0)},r.player.repeat=function(){i.repeat_one?(i.repeat_one=!1,r.player.el.repeat.addClass("off")):(i.repeat_one=!0,r.player.el.repeat.removeClass("off"))},r.player.suffle=function(){i.suffle?(i.suffle=!1,r.player.el.suffle.addClass("off")):(i.suffle=!0,r.player.el.suffle.removeClass("off"))},r.player.volume=function(){t&&t.setVolume(this.value)},r.player.seekTo=function(){t&&t.seekTo(r.player.info.playTotalTime/100*this.value)},r.player.convertTime=function(e){var a=Math.floor(e/60),t=Math.round(e%60)<10?"0"+Math.round(e%60):Math.round(e%60);return a+":"+t},r.player.setProgress=function(){if(t){var e=t.getCurrentTime&&t.getCurrentTime()||0;r.player.el.progressCurrent.text(r.player.convertTime(e)),r.player.el.progress.val(parseInt(e/r.player.info.playTotalTime*100),10)}},r.player.notification=function(e,t,o){if("Notification"in a){var i=a.Notification;if(e=e||"",t=t||"",o=o||"","granted"===i.permission){var n=new Notification("S MUSIC",{body:e+" - "+t,icon:o});setTimeout(function(){n.close()},2e3)}}},r.player.resize=function(){var a=e("#stage").width(),t=parseInt(a/100*56.25,10);e("#video").attr({width:a,height:t})},e(function(){var a=r.player;r.genre(),e("#play").on("click",a.play),e("#pause").on("click",a.pause),e("#prev").on("click",a.prev),e("#next").on("click",a.next),e("#repeat").on("click",a.repeat),e("#suffle").on("click",a.suffle),e("#volume-control").on("click",function(){e("#dialog").toggle()}),e("#volume").on("change",a.volume),e("#progress").on("change",a.seekTo),e("#list-toggle").on("click",function(){e(this).toggleClass("off"),e("#l-wrap").toggleClass("on--list")}),e("#video-toggle").on("click",function(){e(this).toggleClass("off"),e("#l-wrap").toggleClass("on--video")}),e("#lyric-toggle").on("click",function(){e(this).toggleClass("off"),e("#l-wrap").toggleClass("on--lyric")}),e("#list_inner").on("click","a",function(t){t.preventDefault();var o=e(this),i=a.info,l=o.closest("li");n=l.index(),i.artist=o.data("artist"),i.song=o.data("song"),i.songID=o.data("id"),i.albumID=o.data("album"),r.getYoutubeID(i.song,i.artist),r.lyric(i.songID),r.getAlbumImg(i.albumID),e("#display-info").text(o.text()),l.addClass("active").siblings().removeClass("active")}),l&&(e("#video-toggle").click(),e("#lyric-toggle").click())}),e(a).load(function(){"onhashchange"in a&&a.addEventListener("hashchange",function(){r.genre()}),a.Notification&&"granted"!==Notification.permission&&Notification.requestPermission(function(e){Notification.permission!==e&&(Notification.permission=e)}),setTimeout(function(){r.playMoveTarget(0)},1e3)}).resize(function(){r.player.resize()}).resize()}(jQuery,window,void 0);