const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const path = require('path');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const Jimp = require("jimp");
const jssm = require("javascript-state-machine");

var spriterApp = angular.module("spriterApp", []);

spriterApp.controller("spriterController", function($scope) {
  $scope.pictures = [];
  $scope.width = null;
  $scope.height = null;
  $scope.stateMachine = jssm.create({
    initial: 'drop',
    events: [
      { name: 'loading',  from: 'drop',  to: 'loading' },
      { name: 'editor', from: 'loading', to: 'editor' },
      { name: 'drop', from: ['loading', 'editor'], to: 'drop' }
    ]
  });
})
  .directive('dropTarget', function() {
    return function($scope, $element) {

      $element.on('drop', function(e) {
        e.preventDefault();
        $element.removeClass('hover');

        $scope.$apply(function() {
          $scope.stateMachine.loading();
        });

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

        readPics(uploads).then(function(result) {
          $scope.$apply(function() {
            if($scope.pictures.length > 0) {
              $scope.pictures.sort(function(a, b) {
                if(a.path < b.path) return -1;
                if(a.path > b.path) return 1;
                return 0;
              });
              $scope.stateMachine.editor();
            }
            else {
              $scope.stateMachine.drop();
            }
          });
        });
      });

      var readPics = function(uploads) {
        var promises = uploads.map(function(path) {
          return new Promise(function(resolve, reject) {
            if(fs.statSync(path).isFile()) {
              var buffer = readChunk.sync(path, 0, 262);
              var ft = fileType(buffer);
              Jimp.read(path, function(err, pic) {
                var solved = false;
                if(!err) {
                  $scope.$apply(function() {
                    if(!$scope.width) {
                        $scope.width = pic.bitmap.width;
                        $scope.height = pic.bitmap.height;
                    }
                    if(pic.bitmap.width == $scope.width && pic.bitmap.height == $scope.height) {
                      $scope.pictures.push({
                        pic: pic,
                        path: path
                      });
                      solved = true;
                    }
                  });
                }
                resolve(solved);
              });
            }
            else {
              resolve(false);
            }
          });
        });
        return Promise.all(promises);
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
