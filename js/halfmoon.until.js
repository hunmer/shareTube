
halfmoon._toggleSidebar= halfmoon.toggleSidebar;
halfmoon.toggleSidebar = () => {
    halfmoon._toggleSidebar();
    var btn = $('#closeSidebar');
    g_cache.hide = $('#page-wrapper').attr('data-sidebar-hidden') == 'hidden';
    if (g_cache.hide) {

    } else {
        
    }
}

halfmoon._toggleModal= halfmoon.toggleModal;
halfmoon.toggleModal = (id) => {
    halfmoon._toggleModal(id);
    startVibrate(50);
}

halfmoon._toggleDarkMode= halfmoon.toggleDarkMode;
halfmoon.toggleDarkMode = () => {
    halfmoon._toggleDarkMode();
    g_config.darkMode = $('body').hasClass('dark-mode');
    local_saveJson('config', g_config);
}


function toastPAlert(msg, type, time, title) {
    halfmoon.initStickyAlert({
        content: msg,
        title: title || '',
        alertType: type || "alert-primary",
        hasDismissButton: false,
        timeShown: time || 3000
    });
}

function hideSidebar() {
    if(!g_cache.hide){
        halfmoon.toggleSidebar();
    }
}

function setProgress(value, selector='.progress-bar') {
    $(selector).css('width', + value + '%');
}