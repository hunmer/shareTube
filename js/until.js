String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}
var g_api = './php/';
// var g_api = 'https://sharetube-api.glitch.me/';
var _GET = getGETArray();
var g_localKey = 'shareTube_';
// 本地储存前缀
var g_config = local_readJson('config', {
    lastId: 'DD1JfUPaPp4',
    history: {},
    audioMode: false,
    darkMode: false,
});
var g_data = local_readJson('datas', {});

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if (data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul) {
    if (!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}


function getGETArray() {
    var a_result = [],
        a_exp;
    var a_params = window.location.search.slice(1).split('&');
    for (var k in a_params) {
        a_exp = a_params[k].split('=');
        if (a_exp.length > 1) {
            a_result[a_exp[0]] = decodeURIComponent(a_exp[1]);
        }
    }
    return a_result;
}


function randNum(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}


function toTime(s) {
    var a = s.split(':');
    if (a.length == 2) {
        a.unshift(0);
    }
    return a[0] * 3600 + a[1] * 60 + a[2] * 1;
}


function removeAnimation(d) {
    var x = d.attr('animated');
    if (x != undefined) {
        d.removeClass('animated ' + x).attr('animated', null);
    }
    return x;
}


function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}


var g_actions = {};

function registerAction(name, callback) {
    g_actions[name] = callback;
}

function cutString(s_text, s_start, s_end, i_start = 0) {
    i_start = s_text.indexOf(s_start, i_start);
    if (i_start === -1) return '';
    i_start += s_start.length;
    i_end = s_text.indexOf(s_end, i_start);
    if (i_end === -1) return '';
    return s_text.substr(i_start, i_end - i_start);
}



function copyText(text) {
    if (!$('#modal-copy').length) {
        $(`<div class="modal" id="modal-copy" tabindex="-1" role="dialog" style="z-index: 99999;">
        <div class="modal-dialog" role="document">
            <div class="modal-content modal-content-media w-500">
                <a class="close" role="button" aria-label="Close" onclick="halfmoon.toggleModal('modal-copy');">
                    <span aria-hidden="true">&times;</span>
                </a>
                <h5 class="modal-title text-center">copy</h5>
                <div class="modal-html"><div class="input-group">
          <textarea class="form-control" id="input_copy" disbaled>` + text + `</textarea>
        </div>
        <button class="form-control bg-primary btn-block" onclick="$('#input_copy').select();document.execCommand('copy');halfmoon.toggleModal('modal-copy');">copy</button>
                </div>
            </div>
        </div>
    </div>`).appendTo('body');
    }
    halfmoon.toggleModal('modal-copy');
}

function shareCard(url) {
    if ($('#modal-card').length) $('#modal-card').remove();
        var h = `
        <div class="modal" id="modal-card" tabindex="-1" role="dialog" style="z-index: 99999;">
            <div class="modal-dialog" role="document">
                <div class="modal-content modal-content-media w-500">
                    <a class="close" role="button" aria-label="Close" onclick="halfmoon.toggleModal('modal-card');">
                        <span aria-hidden="true">&times;</span>
                    </a>
                    <h5 class="modal-title text-center">share</h5>
                    <div class="modal-html">
                        <div class="mw-full p-10">

                          <div class="card p-0"> 
                            
                          <div class="position-relative row" style="    min-height: 300px;">
                          <span style="position: absolute;right: 10px;top: 10px;z-index: 2;" class="badge badge-primary">
                              <i class="fa fa-clock-o text-white mr-10" aria-hidden="true"></i>{all}
                            </span>
        `;
        var i = 0;
        var t;
        var all = 0;
        var h1 = '';
        var data = g_cache.subTitlte;
        for (var id in data) {
            h+=`<img id='share_cover' style="background-image: url(`+ g_api+'image.php?url='+btoa('https://i.ytimg.com/vi/'+id+'/mqdefault.jpg')+`)" class="bg col-`+(parseInt(12/Object.keys(data).length))+`">`;
                            
        for (var start in data[id]) {
            i++;
            var d = data[id][start];
            t = parseInt(d.end-start);
            all += t;
            h1 += `<div style="display: inline-flex" contenteditable=true><strong>` + i + '.' + d.title + `</strong><br />` + d.desc + `<span class="badge ml-10">`+getTime(t)+`</span></div><hr />`;
        }
    }

        h += `</div>
        <div class="content">
      <h2 class="content-title text-center" contenteditable=true>
        ` + g_player.data.title+ `
      </h2>
      <div class="content position-relative" style="min-height: 128px">
         <div id="qrcode" style="position: absolute;right: 10px;bottom: 5px;"></div>
        `+h1+`</div></div><textarea class="form-control" id="input_copy" disbaled>` + url + `</textarea><div class="btn-group w-full" role="group"><button class="form-control bg-primary btn-block" onclick="generatorImage()">download</button><button class="form-control bg-primary btn-block" onclick="$('#input_copy').select();document.execCommand('copy');halfmoon.toggleModal('modal-copy');">copy</button></div></div></div></div></div></div></div>`;
        $(h.replace('{all}', getTime(all))).appendTo('body');

        new QRCode("qrcode", {
            text: url,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    halfmoon.toggleModal('modal-card');
}

function getShareurl(){
    toastPAlert('loading...', 'alert-secondary');
    // location.protocol + '//' + location.host + '/
    var base = 'https://hunmer.github.io/shareTube/youtube.html?i=' + g_id+'&s='+g_player.getPlaybackRate();
    var data = window.encodeURIComponent(JSON.stringify(g_cache.subTitlte));
    if(data.length <= 100){
        return shareCard(base+'&r'+data);
    }
    $.ajax({
        url: g_api+'api.php',
        type: 'POST',
        dataType: 'json',
        data: {data: JSON.stringify(g_cache.subTitlte)},
    })
    .done(function(data) {
        shareCard(base+'&d='+data.key);
    })
    .fail(function() {
    })
    .always(function() {
    });
}

function getTime(s) {
    s = Number(s);
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    return _s1(h, ':') + _s(m, ':') + _s(s);
}


function _s1(s, j = '') {
    s = parseInt(s);
    return (s == 0 ? '' : (s < 10 ? '0' + s : s) + j);
}



function _s(i, j = '') {
    return (i < 10 ? '0' + i : i) + j;
}

function generatorImage(){
    // var img = $('#share_cover')[0];
    // img.useCORS=true;//解决跨域
    // img.crossOrigin="Anonymous";//解决跨域
    toastPAlert('downloading...', 'alert-secondary');
     var dark = $('.dark-mode').length;
      html2canvas($('#modal-card .modal-html .mw-full')[0], {
            backgroundColor: dark ? '#000000d9' : '#fff',
            useCORS: true,
        }).then(function(canvas) {
             downloadImg(canvas.toDataURL(), g_player.data.title);
        });
}

 function downloadImg(url, fileName){
        var a = document.createElement('a');
        var event = new MouseEvent('click');
        a.download = fileName;
        a.href = url;
        a.dispatchEvent(event);
    }