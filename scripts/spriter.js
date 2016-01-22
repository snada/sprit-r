const electron = require('electron');
const app = electron.app;

var spriterApp = angular.module("spriterApp", []);

spriterApp.controller("spriterController", function($scope) {
  $scope.pictures = [];
})
  .directive('dropTarget', function() {
    return function($scope, $element) {

      $element.on('drop', function(e) {
        e.preventDefault();
        $element.removeClass('hover');
        return $scope.$apply(function() {
          var uploads = e.originalEvent.dataTransfer.files;
          for(var counter = 0; counter < uploads.length; counter++) {
            $scope.pictures.push(uploads[counter].path);
          }
        });
      });

      $element.on('dragover', function() {
        $element.addClass('hover');
      });

      $element.on('dragleave', function() {
        $element.removeClass('hover');
      });

      $element.on('dragenter dragstart dragend dragleave dragover drag', function(e) {
        e.preventDefault();
      })
    };

  });
