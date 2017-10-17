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
          monitoramento: '=',
          previsoes: '=',
          data: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3;

            // Set the dimensions of the canvas / graph
            var margin = {top: 20, right: 20, bottom: 20, left: 20},
                width = 400 - margin.left - margin.right,
                height = 70 - margin.top - margin.bottom;

            // Parse the date / time
            var localized = d3.locale({
              "decimal": ",",
              "thousands": ".",
              "grouping": [3],
              "currency": ["R$", ""],
              "dateTime": "%d/%m/%Y %H:%M:%S",
              "date": "%d/%m/%Y",
              "time": "%H:%M:%S",
              "periods": ["AM", "PM"],
              "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
              "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
              "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
              "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            });
            var parseDate = d3.time.format("%d/%m/%Y").parse;

            // Set the ranges
            var x1 = d3.time.scale().range([0, width/2]);
            var x2 = d3.time.scale().range([width/2, width]);
            var y = d3.scale.linear().range([height, 0]);
            var x1Axis = d3.svg.axis().scale(x1).orient("bottom").tickFormat(localized.timeFormat("%d %b"));
            var x2Axis = d3.svg.axis().scale(x2).orient("bottom").tickFormat(localized.timeFormat("%d %b"));

            // Define the line
            var valueline1 = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x1(d.date); })
                .y(function(d) { return y(d.volume); });
            var valueline2 = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x2(d.date); })
                .y(function(d) { return y(d.volume); });
            var valuearea = d3.svg.area()
                .interpolate("basis")
                .x(function(d) { return x1(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.volume); });

            // Adds the svg canvas
            var svgFrame = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%'});

            var svg = svgFrame.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var gLines = svg.append("g").attr("class", "lines");
            var gAxis = svg.append("g").attr("class", "axis");
            var gDetails = svg.append("g").attr("class", "details");
            var gTexts = svg.append("g").attr("class", "texts");

            var line1Svg = gLines.append("path");
            var line2Svg = gLines.append("path");
            var line3Svg = gLines.append("path");
            var areaSvg = gLines.append("path");
            var dayStroke = gDetails.append('line');
            var endCircle = gDetails.append('circle');
            var title1 = gTexts.append('text');
            var title2 = gTexts.append('text');
            var x1AxisSvg = gAxis.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")");
            var x2AxisSvg = gAxis.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")");
            var strokeRetirada = gTexts.append('line');
            var circleRetirada = gTexts.append('circle');
            var strokeOutorga = gTexts.append('line');
            var circleOutorga = gTexts.append('circle');

            scope.$watchCollection(function(scope) { return [scope.monitoramento, scope.previsoes, scope.data]; }, function(newValue) {
              if ((typeof newValue[0] !== 'undefined') && (newValue[0].volumes.length !== 0) && (typeof newValue[1] !== 'undefined') && (typeof newValue[2] !== 'undefined')) {
                draw(newValue[0], newValue[1], newValue[2]);
              }
            });

            // Get the data
            var draw = function(monitoramento, previsoes, data) {
              console.log(monitoramento.volumes.length);
              console.log(previsoes.outorga.calculado);
              console.log(previsoes.previsao.calculado);

              var
                volumes = monitoramento.volumes,
                regression = monitoramento.coeficiente_regressao,
                previsaoOutorga = previsoes.outorga,
                previsaoRetirada = previsoes.previsao,
                volumeMorto = +previsoes.volume_morto,
                dataBase = parseDate(data);

              volumes.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.volume = +d.Volume;
              });

              previsaoRetirada.volumesD = [];
              previsaoRetirada.volumes.forEach(function(d, i) {
                previsaoRetirada.volumesD.push({
                  date: d3.time.day.offset(dataBase, i+1),
                  volume: +d
                });
              });
              previsaoOutorga.volumesD = [];
              previsaoOutorga.volumes.forEach(function(d, i) {
                previsaoOutorga.volumesD.push({
                  date: d3.time.day.offset(dataBase, i+1),
                  volume: +d
                });
              });

              // Scale the range of the data
              var allVolumes = [volumes, previsaoRetirada.volumesD, previsaoOutorga.volumesD];
              var min = d3.min(allVolumes.map(function(v) {
                return d3.min(v, function(d) { return d.volume; });
              }));
              var max = d3.max(allVolumes.map(function(v) {
                return d3.max(v, function(d) { return d.volume; });
              }));
              x1.domain(d3.extent(volumes, function(d) { return d.date; }));
              x2.domain([dataBase, d3.time.day.offset(dataBase, 180)]);
              y.domain([min, max]);
              x1Axis.tickValues([
                volumes[0].date,
                volumes[volumes.length-1].date
              ]);
              x2Axis.tickValues([
                previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date,
                previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date
              ]);

              // Add the valueline path.
              line1Svg
                .style({
                  "fill": "none",
                  "stroke-width": "1",
                  "stroke": color(regression)
                })
                .attr("class", "tendencia")
                .attr("d", valueline1(volumes));
              line2Svg
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(88, 182, 235)"
                })
                .attr("class", "retirada")
                .attr("d", valueline2(previsaoRetirada.volumesD));
              line3Svg
                .style({
                  "fill": "none",
                  "stroke-width": "0.8",
                  "stroke": "rgb(67, 107, 224)"
                })
                .attr("class", "outorga")
                .attr("d", valueline2(previsaoOutorga.volumesD));
              areaSvg
                .style({
                  "fill-opacity": "0.1",
                  "fill": color(regression)
                })
                .attr("d", valuearea(volumes));

              // Details
              dayStroke
                .attr('x1', width * 0.5)
                .attr('y1', -margin.top)
                .attr('x2', width * 0.5)
                .attr('y2', height + (margin.bottom * 0.5))
                .style({
                  "stroke": "gray",
                  "stroke-width": "0.5",
                  "stroke-dasharray": "4,2"
                });
              endCircle
                .attr('cx', width * 0.5)
                .attr('cy', y(volumes[volumes.length-1].volume))
                .attr('r', 3)
                .style({
                  "fill": color(regression)
                });

              // Texts
              title1
                .attr('x', width * 0.25)
                .attr('y', -10)
                .attr('font-size', '8px')
                .attr('text-anchor', 'middle')
                .text("Últimos meses");
              title2
                .attr('x', width * 0.75)
                .attr('y', -10)
                .attr('font-size', '8px')
                .attr('text-anchor', 'middle')
                .text("Previsão, se não chover");
              // Axis
              x1AxisSvg.call(x1Axis);
              x2AxisSvg.call(x2Axis);
              strokeRetirada
                .attr('x1', x2(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date))
                .attr('y1', -margin.top)
                .attr('x2', x2(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date))
                .attr('y2', height + (margin.bottom * 0.5))
                .style({
                  "stroke": "gray",
                  "stroke-width": "0.5",
                  "stroke-dasharray": "4,2"
                });
              circleRetirada
                .attr('cx', x2(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date))
                .attr('cy',  y(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].volume))
                .attr('r', 3)
                .style({
                  "fill": "rgb(88, 182, 235)"
                });
              strokeOutorga
                .attr('x1', x2(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date))
                .attr('y1', -margin.top)
                .attr('x2', x2(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date))
                .attr('y2', height + (margin.bottom * 0.5))
                .style({
                  "stroke": "gray",
                  "stroke-width": "0.5",
                  "stroke-dasharray": "4,2"
                });
              circleOutorga
                .attr('cx', x2(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date))
                .attr('cy',  y(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].volume))
                .attr('r', 3)
                .style({
                  "fill": "rgb(67, 107, 224)"
                });

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
                return "translate("+(width / 2)+", "+(height + 10)+"), rotate(-180 5 0)";
              }
              return "translate("+(width / 2)+", "+(height + 5)+")";
            }

          };
        }
      };
    }
})();
