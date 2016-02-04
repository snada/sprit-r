const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const path = require('path');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const Jimp = require("jimp");

var spriterApp = angular.module("spriterApp", []);

spriterApp.controller("spriterController", function($scope) {
  $scope.pictures = [];
  $scope.width = null;
  $scope.height = null;
})
  .directive('dropTarget', function() {
    return function($scope, $element) {

      $element.on('drop', function(e) {
        e.preventDefault();
        $element.removeClass('hover');

        var uploads = [].slice.call(e.originalEvent.dataTransfer.files).map(function(object) {
          return object.path;
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
          if(fs.statSync(uploads[counter]).isFile()) {
            var buffer = readChunk.sync(uploads[counter], 0, 262);
            var ft = fileType(buffer);
            if (ft && ft.mime && ft.mime.split('/')[0] == "image") {
              readPics(uploads[counter]);
            }
          }
        }
      });

      var readPics = function(path) {
        Jimp.read(path, function(err, pic) {
          if(!err) {
            if(!$scope.width) {
              $scope.$apply(function(){
                $scope.width = pic.bitmap.width;
                $scope.height = pic.bitmap.height;
              });
            }

            if(pic.bitmap.width == $scope.width && pic.bitmap.height == $scope.height) {
              $scope.$apply(function() {
                $scope.pictures.push({
                  pic: pic,
                  path: path
                });
              });
            }
          }
        });
      };

      $element.on('dragenter', function(e) {
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
      });

      $element.on('dragover', function(e) {
        $element.addClass('hover');
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
      });

      $element.on('dragleave', function() {
        $element.removeClass('hover');
      });

      $element.on('dragstart dragend dragleave drag', function(e) {
        e.preventDefault();
      });
    };

  });
