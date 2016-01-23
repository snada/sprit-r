const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const path = require('path');

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

          var uploads = [].slice.call(e.originalEvent.dataTransfer.files).map(function(object) {
            return object.path
          });

          if(uploads.length == 1 && fs.statSync(uploads[0]).isDirectory()) {
            baseDir = uploads[0];
            uploads = [];
            files = fs.readdirSync(baseDir);
            for(var counter = 0; counter < files.length; counter++) {
              uploads.push(baseDir + path.sep + files[counter]);
            }
          }

          for(var counter = 0; counter < uploads.length; counter++) {
            $scope.pictures.push(uploads[counter]);
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
