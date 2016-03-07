$(function(){
    var path = window.location.pathname;
    $('nav li a[href="'+path+'"]').parents('li').addClass('active');
});