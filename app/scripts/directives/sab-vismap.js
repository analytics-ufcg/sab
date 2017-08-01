(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabVismap', sabVismap);

    sabVismap.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabVismap($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {},
        link: function postLink(scope, element) {
          var source = {
            type: 'MapBoxStudio',
            mapId: 'cj3x16wjm0rwe2ro3820wtie2',
            userId: 'diegocoelhods',
            accessToken: 'pk.eyJ1IjoiZGllZ29jb2VsaG9kcyIsImEiOiJjajN4MTFnbWUwMDlhMnFyeXU5dGNtbGw0In0.EYzAmrfQzUw3aPlVKZOIWA'
          }
          if ( $(window).width() <= 1000 ) {
            var zoomInicial = 5;
            var latitude = -9.4044477;
            var longitude = -40.507917;
          } else {
            var zoomInicial = 6;
            var latitude = -10.240929;
            var longitude = -44.231820;
          }
          var url = 'https://api.mapbox.com/styles/v1/' + source.userId + '/' + source.mapId + '/tiles/{z}/{x}/{y}?access_token=' + source.accessToken;

          var map = new ol.Map({
            layers: [
              new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: url,
                  // attributions: createAttribution(source),
                  tilePixelRatio: 1,
                  tileSize: [512, 512],
                  wrapX: true
                })
              })
              // ,
              // new ol.layer.Tile({
              //   source: new ol.source.Vector({
              //     url: 'http://localhost:5003/api/estados/sab',
              //     format: new ol.format.TopoJSON()
              //   })
              // })
            ],
            target: 'map',
            view: new ol.View({
              center: ol.proj.fromLonLat([longitude, latitude]),
              zoom: zoomInicial
            })
          });


          /**
           * Load the topojson data and create an ol.layer.Image for that data.
           */
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
            var canvasFunction = function(extent, resolution, pixelRatio,
                size, projection) {
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

            var layer = new ol.layer.Image({
              source: new ol.source.ImageCanvas({
                canvasFunction: canvasFunction,
                projection: 'EPSG:3857'
              })
            });
            map.addLayer(layer);
          });

        }
      };
    }
})();
