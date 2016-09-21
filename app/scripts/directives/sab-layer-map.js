'use strict';

/**
 * @ngdoc directive
 * @name sabApp.directive:sabLayerMap
 * @description
 * # sabLayerMap
 */
angular.module('sabApp')
  .directive('sabLayerMap', function () {
    return {
      restrict: 'E',
      link: function postLink() {
        new ol.Map({
          target: 'map'
        });
      }
    };
  });
