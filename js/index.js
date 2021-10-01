 var g_cache = {
     timer: 0,
     last: 0,
     subTitlte: {},
 };
 var g_id;
 var _audio = $('#tip')

 function soundTip(url) {
     _audio.src = url;
     _audio.play();
 }

 $(function() {

     $('[data-change="darkMode"]').prop('checked', g_config.darkMode);
     $('[data-change="audioMode"]').prop('checked', g_config.audioMode);
     $(document).on('click', '[data-action]', function(event) {
         doAction(this, $(this).attr('data-action'));
     }).on('dblclick', '[data-dbaction]', function(event) {
         doAction(this, $(this).attr('data-dbaction'));
     }).
     on('change', function(event) {
         var d = $(event.target);
         switch (d.attr('data-change')) {
             case 'darkMode':
                 halfmoon.toggleDarkMode();
                 break;

             case 'audioMode':
                 g_config.audioMode = !g_config.audioMode;
                 local_saveJson('config', g_config);
                 break
         }
     }).
     on('input', function(event) {
         var d = $(event.target);

         switch (d.attr('data-input')) {
             case 'start':
                 var s = parseInt(d.val());
                 var e = getEnd();
                 if (s > e) {
                     s = e;
                     d.val(s);
                 }
                 g_player.seekTo(s);
                 break;
             case 'end':
                 var s = getStart();
                 var e = parseInt(d.val());
                 if (e < s) {
                     e = s;
                     d.val(s);
                 }
                 g_player.seekTo(e);
                 break;
         }
     });

     window.onkeydown = (e) => {
         if ($('input:focus').length) return;
         switch (e.code) {
             case 'Digit1':
                 $('#input_start').val(parseInt(g_player.getCurrentTime()));
                 break;
             case 'Digit2':
                 $('#input_end').val(parseInt(g_player.getCurrentTime()));
                 break;
             case 'ArrowRight':
                 next();
                 break;

             case 'ArrowLeft':
                 prev();
                 break;

             case 'Space':
                 g_player.toggle();
                 break;
         }
     }
     initHistory();
 });

 function next() {
     var d = $('.playing');
     if (!d.length) {
         return $('[data-start]:eq(0)').click();
     }
     var next = d.next();
     if (!next.length) {
         g_player.pause();
         return toastPAlert('over');
     }
     next.click();
 }

 function prev() {
     $('.playing').prev().click()

 }

 function initSubtitle(id, json) {
     var h = ``;
     var i = 0;
     for (var start in json) {
         i++;
         var d = json[start];
         h += `<tr data-action="dbclick_subtitle" data-start="` + start + `" data-end="` + d.end + `">
      <th>` + i + `</th>
      <td clas="title">` + d.title + `</td>
      <td class="desc">` + d.desc + `</td>
      <td class="text-right"> <i data-action="favorite" class="fa fa-lg fa-star` + (d.favorited ? ' text-secondary' : '-o') + `" aria-hidden="true"></i>
                              </td>
    </tr>`;
     }
     $('tbody').html(h);
 }

 function saveHistory(id, json = {}) {
     var d = g_config.history[id] ? g_config.history[id] : {};
     d.t = new Date().getTime();
     g_config.history[id] = Object.assign(d, json);
     var keys = Object.keys(g_config.history);
     for (var i = 50; i < keys.length; i++) {
         delete g_config.history[keys[i]];
     }
     local_saveJson('config', g_config);
     initHistory();
 }

 function onYouTubeIframeAPIReady(id) {
     // https://www.youtube.com/watch?v=DD1JfUPaPp4
     if (id == '' || id == undefined) {
         id = _GET['id'] ? _GET['id'] : g_config.lastId;
     } else {
         g_config.lastId = id;
         local_saveJson('config', g_config);
     }
     g_id = id;
     var data = {};
     if (g_data[id]) {
         data = g_data[id];
     } else
     if (_GET['data']) {
         data = JSON.parse(window.decodeURIComponent(atob(_GET['data'])));
         g_data[id] = data;
         local_saveJson('datas', g_data);
         $('[data-action="test"]').addClass('btn-primary');
         window.history.pushState(null, null, window.location.href.split("?")[0]);
     }

     if (data) {
         g_cache.subTitlte = data;
         initSubtitle(id, data);
     }
     g_player.load(g_config.audioMode ? 'audio' : 'video', id);
 }

 function initHistory() {
     var h = '';
     var d = g_config.history;
     for (var id of Object.keys(d).sort(function(a, b) {
             return d[b].t - d[a].t;
         })) {
         h += `<div class="card sponsor-section-card w-350 mw-full m-0 p-0 d-flex" rel="noopener">
    <div class="w-100 h-100 m-10 align-self-center">
        <div class="w-100 h-100 rounded d-flex align-items-center justify-content-center" style="background-color: #5352ed;">
            <img data-src="https://i.ytimg.com/vi/` + id + `/mqdefault.jpg" class="w-100 h-100 lazyload" onclick="window.open('https://www.youtube.com/watch?v=` + id + `', '_blank')">
        </div>
    </div>
    <div class="flex-grow-1 overflow-y-hidden d-flex align-items-center position-relative h-120">
        <div class="p-10 w-full m-auto">
            <p class="font-size-10 text-dark-lm text-light-dm m-0 mb-5 text-truncate font-weight-medium">
                 ` + d[id].author + `
            </p>
            <p class="font-size-12 mt-5 mb-0">
                 ` + d[id].title + `
                <span class="text-primary text-smoothing-auto-dm d-inline-block" onclick="onYouTubeIframeAPIReady('` + id + `')">Watch <i class="fa fa-angle-right" aria-hidden="true"></i></span>
            </p>
        </div>
        <div class="sponsor-section-card-scroll-block"></div>
    </div>
</div>`
     }
     $('#history').html(h).find('.lazyload').lazyload();
 }


 function initTitle() {
     var title = g_player.data.title;
     document.title = title;
 }

 function deleteSelected(del = false) {
     var start = getStart();
     if (g_cache.selected) {
         if (del || g_cache.selected != start) {
             delete g_cache.subTitlte[g_cache.selected];
             g_cache.selected = -1;
         }
     }
     $('[data-action="add"] i').addClass('fa-plus').removeClass('fa-check');
     reset();
     initSubtitle(g_id, g_cache.subTitlte);
     $('[data-action="save"]').removeClass('hide').addClass('btn-primary');
 }

 function getStart() {
     return parseInt($('#input_start').val());
 }

 function getEnd() {
     return parseInt($('#input_end').val());
 }

 function reset() {
     $('#input_start, #input_end, #input_text, #input_desc').val('');
 }

 function doAction(dom, action, params) {
     var action = action.split(',');
     if (g_actions[action[0]]) {
         return g_actions[action[0]](dom, action, params);
     }
     switch (action[0]) {
         case 'add':
             var start = getStart();
             var end = getEnd();
             if (start > end) {
                 return alert('end < start');
             }
             g_cache.subTitlte[start] = {
                 end: end,
                 title: $('#input_text').val(),
                 desc: $('#input_desc').val(),
             }
             deleteSelected();
             break;
         case 'delete':
             deleteSelected(true);
             break;
         case 'share':
             copyText(location.protocol + '//' + location.host + location.pathname + '?id=' + g_id + '&speed='+g_player.getPlaybackRate()+'&data=' + btoa(window.encodeURIComponent(JSON.stringify(g_cache.subTitlte))));
             break;
         case 'save':
             g_data[g_id] = g_cache.subTitlte;
             local_saveJson('datas', g_data);
             $('[data-action="save"]').addClass('hide').removeClass('btn-primary');
             break;
         case 'edit':
             var b = $(dom).toggleClass('btn-primary').hasClass('btn-primary');
             if (b) {
                 $('.navbar-fixed-bottom').removeClass('hide');
             } else {
                 $('.navbar-fixed-bottom').addClass('hide');

             }
             break;
         case 'test':
             var b = $(dom).toggleClass('btn-primary').hasClass('btn-primary');
             break;
         case 'play':
             var b = $(dom).toggleClass('btn-secondary').hasClass('btn-secondary');
             if (b) {
                 g_player.seekTo(getStart());
             } else {
                 g_player.playVideo();
             }
             break;
         case 'dbclick_subtitle':
             g_cache.selected = -1;
             var d = $(dom);
             var start = d.attr('data-start');
             var end = d.attr('data-end');
             $('#input_start').val(start);
             $('#input_end').val(end);
             $('#input_text').val(d.find('.title').val());
             $('#input_desc').val(d.find('.desc').val());
             $('[data-action="add"] i').removeClass('fa-plus').addClass('fa-check');
             g_cache.selected = start;
             g_player.toSubtitle(start, end, true);
             g_player.seekTo(start);
             g_player.playVideo();
             break;

         case 'confirm_openUrl':
             var url = prompt('input url', 'https://www.youtube.com/watch?v=v22JJP1GBAI');
             if (url != '') {
                 var id = cutString(url + '&', '?v=', '&');
                 if (id == '') id = url;
                 onYouTubeIframeAPIReady(id);
             }
             break;

         case 'favorite':
             var par = $(dom).parents('[data-start]');
             var start = par.attr('data-start');
             if ($(dom).hasClass('fa-star-o')) {
                 $(dom).attr('class', 'fa fa-star fa-lg text-secondary');
                 g_data[g_id][start].favorited = true;
             } else {
                 $(dom).attr('class', 'fa fa-lg fa-star-o');
                 g_data[g_id][start].favorited = false;
             }
             local_saveJson('datas', g_data);
             break;

     }
 }