$('#editor-dragbar').on('mousedown', function(e) {
  e.preventDefault();

  $(document).on('mousemove', function(e) {
    if(e.pageX < $(document).width() / 2 && e.pageX >= 0) {
      $('#editor-sidebar').css('width', e.pageX);
      $('#editor-content').css('left', e.pageX);
    }
  });
});

$(window).on('resize', function() {
  var limit = $(document).width() / 2;
  if($('#editor-sidebar').width() > limit) {
    $('#editor-sidebar').css('width', limit);
  }
});

$(document).on('mouseup', function(e){
  $(document).unbind('mousemove');
});
