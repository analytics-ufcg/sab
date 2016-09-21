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
      link: function postLink(scope, element, attrs) {
        var map = new ol.Map({
          target: 'map',
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM.Mapnik("Mapnik");
            })
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([-10.240929, -44.231820]),
            zoom: 5
          })
        });
      }
    };
  });
