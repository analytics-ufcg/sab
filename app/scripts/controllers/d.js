(function() {
  'use strict';

  angular.module('sabApp')
    .controller('DCtrl', DCtrl);

  DCtrl.$inject = ['$scope'];

  /*jshint latedef: nofunc */
  function DCtrl($scope) {
    var vm = this;
    vm.center = {
        lat: 30,
        lon: 0,
        zoom: 2
    };
    vm.layers = [
        {
            name: 'OSM',
            source: {
                type: "OSM",
                url: "http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        }
    ];
    vm.defaults = {
        events: {
            layers: [ 'mousemove', 'click' ]
        }
    }
    vm.addLayer = addLayer;

    function addLayer() {
      d3.json('https://openlayers.org/en/v4.2.0/examples/data/topojson/us.json', function(error, us) {
        var features = topojson.feature(us, us.objects.counties);

        /**
         * This function uses d3 to render the topojson features to a canvas.
         * @param {ol.Extent} extent Extent.
         * @param {number} resolution Resolution.
         * @param {number} pixelRatio Pixel ratio.
         * @param {ol.Size} size Size.
         * @param {ol.proj.Projection} projection Projection.
         * @return {HTMLCanvasElement} A canvas element.
         */
        var canvasFunction = function(extent, resolution, pixelRatio, size, projection) {
          var canvasWidth = size[0];
          var canvasHeight = size[1];

          var canvas = d3.select(document.createElement('canvas'));
          canvas.attr('width', canvasWidth).attr('height', canvasHeight);

          var context = canvas.node().getContext('2d');

          var d3Projection = d3.geo.mercator().scale(1).translate([0, 0]);
          var d3Path = d3.geo.path().projection(d3Projection);

          var pixelBounds = d3Path.bounds(features);
          var pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
          var pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];

          var geoBounds = d3.geo.bounds(features);
          var geoBoundsLeftBottom = ol.proj.transform(
              geoBounds[0], 'EPSG:4326', projection);
          var geoBoundsRightTop = ol.proj.transform(
              geoBounds[1], 'EPSG:4326', projection);
          var geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
          if (geoBoundsWidth < 0) {
            geoBoundsWidth += ol.extent.getWidth(projection.getExtent());
          }
          var geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

          var widthResolution = geoBoundsWidth / pixelBoundsWidth;
          var heightResolution = geoBoundsHeight / pixelBoundsHeight;
          var r = Math.max(widthResolution, heightResolution);
          var scale = r / (resolution / pixelRatio);

          var center = ol.proj.transform(ol.extent.getCenter(extent),
              projection, 'EPSG:4326');
          d3Projection.scale(scale).center(center)
              .translate([canvasWidth / 2, canvasHeight / 2]);
          d3Path = d3Path.projection(d3Projection).context(context);
          d3Path(features);
          context.stroke();

          return canvas[0][0];
        };
        console.log(canvasFunction);
        vm.layers.push({
            name: 'D3',
            source: {
                type: 'ImageCanvas',
                canvasFunction: canvasFunction
            }
        });
      });
    }
  }
})();
