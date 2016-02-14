$('#editor-dragbar').on('mousedown', function(e) {
  e.preventDefault();

  $(document).on('mousemove', function(e) {
    if(e.pageX < $(document).width() / 2 && e.pageX >= 0) {
      $('#editor-sidebar').css('width', e.pageX);
      $('#editor-content').css('left', e.pageX);
    }
  });
});

//Window resize event handler
//if editor-sidebar.width > 50%
//  editor.sidebar.width = 50%

$(document).on('mouseup', function(e){
  $(document).unbind('mousemove');
});
