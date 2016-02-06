$('#editor-dragbar').on('mousedown', function(e) {
  e.preventDefault();

  $(document).on('mousemove', function(e) {
    $('#position').html(e.pageX +', '+ e.pageY);
    $('#editor-sidebar').css("width",e.pageX+2);
    $('#editor-preview').css("left",e.pageX+2);
  })
  console.log("leaving mouseDown");
});

$(document).on('mouseup', function(e){
  $(document).unbind('mousemove');
});
