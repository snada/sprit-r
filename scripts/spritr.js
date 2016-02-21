const electron = require('electron');
const remote = require('remote');
const dialog = remote.require('dialog');
const app = electron.app;
const fs = require('fs');
const path = require('path');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const Jimp = require("jimp");
const jssm = require("javascript-state-machine");

var spritrApp = angular.module("spritrApp", []);

spritrApp.controller("spritrController", function($scope) {

  $scope.stateMachine = jssm.create({
    initial: 'drop',
    events: [
      { name: 'loading',  from: 'drop',  to: 'loading' },
      { name: 'editor', from: 'loading', to: 'editor' },
      { name: 'drop', from: ['loading', 'editor'], to: 'drop' }
    ]
  });

  ($scope.reset = function() {
    $scope.pictures = [];
    $scope.matrix = [];
    $scope.width = null;
    $scope.height = null;
    $scope.rows = 0;
    $scope.cols = 0;
    $scope.scale = 100;
  })();

  $scope.frameWidth = function() {
    return Math.floor(($scope.width / 100) * $scope.scale);
  };

  $scope.frameHeight = function() {
    return Math.floor(($scope.height / 100) * $scope.scale);
  };

  $scope.calculateCols = function() {
     var tmp = Math.floor($scope.pictures.length / $scope.rows);
     if(tmp * $scope.rows < $scope.pictures.length) { tmp++; }
     $scope.cols = tmp;
     $scope.calculateMatrix();
  };

  $scope.calculateRows = function() {
     var tmp = Math.floor($scope.pictures.length / $scope.cols);
     if(tmp * $scope.cols < $scope.pictures.length) { tmp++; }
     $scope.rows = tmp;
     $scope.calculateMatrix();
  };

  $scope.deletePics = function() {
    $scope.reset();
    $scope.stateMachine.drop();
  };

  $scope.saveSpritesheet = function() {
    var path = remote.dialog.showSaveDialog(
      remote.BrowserWindow.getFocusedWindow(),
      {
        'title': 'Save',
        'filters': [{ 'name': 'Images', 'extensions': ['png'] }]
      }
    );
    if(path) {
      var spriteSheet = new Jimp($scope.frameWidth() * $scope.cols, $scope.frameHeight() * $scope.rows, function (err, image) {
        for(var row = 0; row < $scope.rows; row++) {
          for(var col = 0; col < $scope.cols; col++) {
            var frame = $scope.matrix[row][col];
            if(frame) {
              image.composite(frame.pic.clone().resize($scope.frameWidth(), $scope.frameHeight()), $scope.frameWidth() * col, $scope.frameHeight() * row);
            }
          }
        }
      });
      spriteSheet.write(path);
    }
  };

  $scope.calculateMatrix = function() {
    $scope.matrix = [];
    for(var counter = 0; counter < $scope.rows; counter++) {
      $scope.matrix.push([]);
    }

    var row = 0;
    for(var counter = 0; counter < $scope.pictures.length; counter++) {
      $scope.matrix[row].push($scope.pictures[counter]);
      if($scope.matrix[row].length == $scope.cols) {
        row++;
      }
    }
  };
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
              $scope.cols = $scope.pictures.length;
              $scope.rows = 1;
              $scope.stateMachine.editor();
              $scope.calculateMatrix();
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
