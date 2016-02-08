$('#editor-dragbar').on('mousedown', function(e) {
  e.preventDefault();

  $(document).on('mousemove', function(e) {
    if(e.pageX < $(document).width() / 2 && e.pageX >= 0) {
      $('#editor-sidebar').css('width', e.pageX);
      $('#editor-dragbar').css('left', e.pageX);
      $('#editor-preview').css('margin-left', e.pageX);
      $('#editor-sidebar-commands').css('width', e.pageX);
    }
  });
});

$(document).on('mouseup', function(e){
  $(document).unbind('mousemove');
});
