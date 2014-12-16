S_MUSIC.VIEW = S_MUSIC.VIEW || {};


S_MUSIC.VIEW.makeSearchList = function(dataList){
    var _template =  _.template( $('#tpl_itemist').html() );
    $('#search-list').html( _template(dataList) );
};