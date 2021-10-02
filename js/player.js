var g_player = {
    obj: undefined,
    dom: undefined,
    data: {
        title: '',
        author: ''
    },
    init: () => {

    },
    load: (type, id) => {
        g_player.data= {
        title: '',
        author: ''
    }
        g_player.type = type;
        g_player.destroy();

        if (g_player.type == 'video') {
            $('#div_player').show().next().addClass('col-xl-6');
            g_player.obj = new YT.Player('player', {
                height: '360',
                width: '100%',
                videoId: id,
                playerVars: { 'autoplay': 1, 'controls': 1 },
                events: {
                    'onReady': g_player.onPlayerReady,
                    'onStateChange': g_player.onPlayerStateChange
                }
            });
        } else {
            $('#div_player').hide().next().removeClass('col-xl-6');
            g_player.dom = $('<audio style="width: 100%;padding: 10px;" controls="controls" src="https://alltubedownload.net/download?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D' + id + '&format=249" autoplay></audio>').appendTo('#audio_ui')[0];
            g_player.dom.oncanplay = g_player.onAudioReady;
            g_player.dom.onerror = () => {
                g_player.dom.src = g_player.dom.src;
            }
            $.getJSON(g_api + 'search.php?server=youtube&type=id&id=' + id, function(json, textStatus) {
               saveHistory(id, json);

                // g_player.dom = $('<audio style="width: 100%;padding: 10px;" controls="controls" src="'+json.url+'" autoplay></audio>').appendTo('.navbar-fixed-bottom')[0];
                g_player.data = {
                    title: json.name,
                    author: json.artist,
                }
                initTitle();

            });
        }

    },

    setPlaybackRate: (rate) => {
        rate = Number(rate);
        console.log(rate);
         if(g_player.obj){
            g_player.obj.setPlaybackRate(rate);
        }else{
            g_player.dom.playbackRate = rate; 
        }
    },

      getPlaybackRate: () => {
          return g_player.obj ? g_player.obj.getPlaybackRate() : g_player.dom.playbackRate; 
    },

    onAudioReady: () => {
        g_player.initVideo();
        g_player.initTimer();
    },

    getDuration: () => {
          return g_player.obj ? g_player.obj.getDuration() : g_player.dom.duratio; 
    },

    initVideo: () => {
        saveHistory(g_id, g_player.data);
        g_player.setVolume(100);
        $('input[type=number]').prop('max', g_player.getDuration());
        initTitle();
        g_player.playVideo();
        g_player.setPlaybackRate(_GET['s'] || 1);
        setTimeout(() => {
            if(g_player.isPause()){
                g_player.playVideo();
            }
        }, 4000);
    },

    onPlayerReady: (event) => {
        
    },

    onPlayerStateChange: (event) => {
        if (event.data == YT.PlayerState.PLAYING) {
            g_player.initTimer();
        }
    },

    getPlayerData: () => {
          return g_player.obj ? g_player.obj.getVideoData() : g_player.data; 

    },

    initTimer: () => {
        if (g_cache.timer) clearInterval(g_cache.timer);
        g_cache.timer = setInterval(g_player.timeupdate, 300);
    },
    timeupdate: () => {
       
        var data =g_player.getPlayerData();
        if(data.author != '' && g_player.data.author == ''){
             g_player.data = {
                title: data.title,
                author: data.author,
            }
            g_player.initVideo();

        }


        var now = g_player.getCurrentTime();
        var run = $('[data-action="test"]').hasClass('btn-primary');
        if($('[data-action="play"]').hasClass('btn-secondary')){
             
            var min = getStart();
            if(min > 0 && now < min){
                return g_player.seekTo(min);
            }
            var max = getEnd();
            if(max > 0 && now > max){
                return g_player.seekTo(min);
            }

        }
         if(run && g_cache.range){
            setProgress(parseInt((g_cache.range.end - now) / g_cache.range.length * 100));
        }

        for (var start in g_cache.subTitlte) {
            var d = g_cache.subTitlte[start];
            if (now >= start && now < d.end) {
                if (g_cache.last == start) return;
                g_cache.last = start;
                g_player.toSubtitle(start, d.end);
                return;
            }
        }
         if(run){
            next();
            return;      
        }
        $('.playing').removeClass('playing');
    },
    toSubtitle: (start, end) => {
        var div = $('[data-start="' + start + '"]');
        if (!div.length) return;
        $('.playing').removeClass('playing');

        var top = div.addClass('playing')[0].offsetTop;

        var half = $('#subtitle').height() / 2
        if (top <= half) {
            top = 0;
        } else {
            top -= half;
        }
        $('#subtitle').animate({
            scrollTop: top
        }, { duration: 200, easing: "swing" });
    },

    setVolume: (volume) => {
        if (g_player.obj) {
            g_player.obj.setVolume(volume);
        } else {
            g_player.dom.volume = volume / 100;
        }
    },

    playVideo: () => {
       
        if (g_player.obj) {
            g_player.obj.playVideo();
        } else {
            g_player.dom.play();
        }
    },

    getCurrentTime: () => {
        return g_player.obj ? g_player.obj.getCurrentTime() : g_player.dom.currentTime;
    },

    seekTo: (time) => {
        time = parseInt(time);
        if(time >= g_player.getDuration()) return;
        if (g_player.obj) {
            g_player.obj.seekTo(time);
        } else {
            g_player.dom.currentTime = time;
        }
    },
    toggle: () => {
        if (g_player.obj) {} else {
            if (g_player.dom.paused) {
                g_player.dom.play();
            } else {
                g_player.dom.pause();
            }
        }
    },
    isPause: () => {
        return g_player.obj ? g_player.obj.getPlayerState() != 1 : g_player.dom.paused;
    },
    pause: () => {
        if (g_player.obj) {
            g_player.obj.pauseVideo();
        } else {
            g_player.dom.pause();
        }
    },

    destroy: () => {
        clearInterval(g_cache.timer);

        if (g_player.obj) {
            g_player.obj.destroy();
            delete g_player.obj;
        } else
        if (g_player.dom) {
            g_player.dom.remove();
            delete g_player.dom;
        }
    }
}