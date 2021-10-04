 var g_cache = {
     timer: 0,
     last: 0,
     subTitlte: {},
     range: {},
     loaded: {}
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
                 showEdit();
                 break;
             case 'end':
                 var s = getStart();
                 var e = parseInt(d.val());
                 if (e < s) {
                     e = s;
                     d.val(s);
                 }
                 g_player.seekTo(e);
                 showEdit();

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
     var data = {};
     if (_GET['r']) {
         loadData(window.decodeURIComponent(_GET['r']));
     } else
     if (_GET['d']) {
         $.getJSON(g_api + 'api.php?key=' + _GET['d'], function(json, textStatus) {
             loadData(json.data);
         });
     }

     initHistory();
 });

 function showEdit() {
     var d = $('[data-action="edit"]');
     if (!d.hasClass('btn-primary')) {
         d[0].click();
     }
 }

 function next() {
     var d = $('.playing');
     if (!d.length) {
         return $('[data-start]:eq(0)').click();
     }
     var next = d.next();
     if (!next.length) {
         g_player.pause();
         return;
     }
     next.click();
 }

 function prev() {
     $('.playing').prev().click()

 }

 function initSubtitle() {
     var json = g_cache.subTitlte;
     var h = ``;
     var i = 0;
     for (var id in json) {
         for (var start in json[id]) {
             i++;
             var d = json[id][start];
             h += `<tr class="` + (id != g_id ? 'disabled' : '') + `" data-action="dbclick_subtitle" data-start="` + start + `" data-end="` + d.end + `" data-id="` + id + `">
          <th>` + i + `</th>
          <td class="title">` + d.title + `</td>
          <td class="desc">` + d.desc + `</td>
          <td class="text-right"> <i data-action="favorite" class="fa fa-lg fa-star` + (d.favorited ? ' text-secondary' : '-o') + `" aria-hidden="true"></i>
                                  </td>
        </tr>`;
         }
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

 function loadData(data) {
     if (typeof(data) != 'object') data = JSON.parse(data);
     console.log(data);
     g_cache.subTitlte = data;
     g_id = Object.keys(data)[0];
     g_player.load(g_config.audioMode ? 'audio' : 'video', g_id);

     initSubtitle();
     $('[data-action="test"]').addClass('btn-primary');
     $('[data-action="dbclick_subtitle"]:eq(0)').click();
     //window.history.pushState(null, null, window.location.href.split("?")[0]);

 }

 function onYouTubeIframeAPIReady(id, callback) {
     // https://www.youtube.com/watch?v=DD1JfUPaPp4
     if (id == '' || id == undefined) {
         id = _GET['i'] ? _GET['i'] : g_config.lastId;
     } else {
         g_config.lastId = id;
         local_saveJson('config', g_config);
     }
     g_id = id;
     if (g_data[id]) {
         g_cache.subTitlte[id] = g_data[id];
         $('[data-action="save"]').removeClass('hide').addClass('btn-primary');
         initSubtitle();
     }
     g_player.load(g_config.audioMode ? 'audio' : 'video', id, callback);
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
             delete g_cache.subTitlte[g_id][g_cache.selected];
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

 function saveData() {
     g_config.lastData = g_cache.subTitlte;
     local_saveJson('config', g_config);

     g_data = Object.assign(g_data, g_cache.subTitlte);
     local_saveJson('datas', g_data);
     $('[data-action="save"]').addClass('hide').removeClass('btn-primary');
 }

 function loadLastData() {
     loadData(g_config.lastData);
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
             if (!g_cache.subTitlte[g_id]) {
                 g_cache.subTitlte[g_id] = {};
             }
             g_cache.subTitlte[g_id][start] = {
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
             getShareurl();
             break;
         case 'save':
             saveData();

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
             var id = d.attr('data-id');
             var start = d.attr('data-start');
             var end = d.attr('data-end');
             g_cache.range[id] = {
                 start: start,
                 end: end,
                 length: end - start,
                 inited: false,
             }
             $('#input_start').val(start);
             $('#input_end').val(end);
             $('#input_text').val(d.find('.title').html());
             $('#input_desc').val(d.find('.desc').html());
             $('[data-action="add"] i').removeClass('fa-plus').addClass('fa-check');
             g_cache.selected = start;
             g_player.toSubtitle(id, start, end, true);

             if (id != g_id) {
                 onYouTubeIframeAPIReady(id, () => {
                     g_player.seekTo(start);
                     g_player.playVideo();
                 });
                 return;
             }

             g_player.seekTo(start);
             g_player.playVideo();
             break;

         case 'confirm_openUrl':
             var url = prompt('input url', 'https://www.youtube.com/watch?v=v22JJP1GBAI');
             if (url == null) return;
             if (url != '') {
                 var id = cutString(url + '&', '?v=', '&');
                 if (id == '') id = cutString(url + '&', 'youtu.be/', '&');
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