(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabVolumeRecenteSm', sabVolumeRecenteSm);

    sabVolumeRecenteSm.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabVolumeRecenteSm($window) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          monitoramento: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3;

            // Set the dimensions of the canvas / graph
            var margin = {top: 5, right: 5, bottom: 5, left: 5},
                width = 100 - margin.left - margin.right,
                height = 50 - margin.top - margin.bottom,
                statusWidth = 10,
                statusHeight = 5;

            // Parse the date / time
            var parseDate = d3.time.format("%d/%m/%Y").parse;

            // Set the ranges
            var x = d3.time.scale().range([0, width-statusWidth]);
            var y = d3.scale.linear().range([height, 0]);

            // Define the line
            var valueline = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.close); });
            var valuearea = d3.svg.area()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.close); });

            // Adds the svg canvas
            var svgFrame = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%'});

            var svg = svgFrame.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svgFrame.append("rect").attr({
              "x": 0,
              "y": 0,
              "width": width + margin.left + margin.right,
              "height": height + margin.top + margin.bottom,
              "style": "fill:none;stroke-width:1;stroke:rgb(0,0,0)"
            });

            svg.append("rect").attr({
              "x": 0,
              "y": 0,
              "width": width,
              "height": height,
              "style": "fill:none;stroke-width:1;stroke:rgb(255,0,0)"
            });

            var arrow = svg.append("path").attr({
              "d": "M36.068,20.176l-29-20C6.761-0.035,6.363-0.057,6.035,0.114C5.706,0.287,5.5,0.627,5.5,0.999v40 c0,0.372,0.206,0.713,0.535,0.886c0.146,0.076,0.306,0.114,0.465,0.114c0.199,0,0.397-0.06,0.568-0.177l29-20 c0.271-0.187,0.432-0.494,0.432-0.823S36.338,20.363,36.068,20.176z",
              "x": 0,
              "y": 0,
              "transform": "scale(0.2) rotate(0 20 20)"
            })

            var lineSvg = svg.append("g").append("path");
            var areaSvg = svg.append("g").append("path");
            var endCircle = svg.append('circle');
            var triangle = svg.append('polygon')
              .attr("points", "0,0 "+statusWidth+",0 "+statusHeight+","+statusHeight+"");

            scope.$watch(function(scope) { return scope.monitoramento; }, function(newValue) {
              if ((typeof newValue !== 'undefined') && (newValue.volumes.length !== 0)) {
                draw(newValue);
              }
            });

            // Get the data
            var draw = function(data) {
              var minData = data.volumes;
              minData.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.close = +d.VolumePercentual;
              });

              // Scale the range of the data
              var min = d3.min(minData, function(d) { return d.close; });
              var max = d3.max(minData, function(d) { return d.close; });
              x.domain(d3.extent(minData, function(d) { return d.date; }));
              y.domain([min, max]);
              // Derive a linear regression
              var regression = data.coeficiente_regressao;

              // Add the valueline path.
              lineSvg
                .style({
                  "fill": "none",
                  "stroke-width": "1",
                  "stroke": color(regression)
                })
                .attr("d", valueline(minData));
              areaSvg
                .style({
                  "fill-opacity": "0.1",
                  "fill": color(regression)
                })
                .attr("d", valuearea(minData));

              endCircle
               .attr('cx', x(minData[minData.length-1].date))
               .attr('cy', y(minData[minData.length-1].close))
               .attr('r', 1.5)
               .style({
                 "fill": color(regression)
               });

               triangle
                .style({
                  "fill": color(regression),
                  "visibility": regression === 0 ? "hidden" : "visible"
                })
                .attr("transform", rotate(regression));

            function color(slope) {
              if (slope > 0) {
                return "#2ecc71";
              } else if (slope < 0){
                return "#e74c3c";
              }
              return "#3498db";
            }

            function rotate(slope) {
              if (slope >= 0) {
                return "translate("+(width-(statusWidth/2))+", "+((height/2)+(statusHeight/2))+"), rotate(-180 5 0)";
              }
              return "translate("+(width-(statusWidth/2))+", "+((height/2)-(statusHeight/2))+")";
            }

          };
        }
      };
    }
})();
