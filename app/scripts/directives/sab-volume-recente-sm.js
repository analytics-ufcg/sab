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

            var svg = svgFrame.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
              gLines = svg.append("g").attr("class", "lines"),
              gAxis = svg.append("g").attr("class", "axis"),
              gDetails = svg.append("g").attr("class", "details"),
              gTexts = svg.append("g").attr("class", "texts");

            var
              lineSvg = gLines.append("path"),
              lineRetirada = gLines.append("path"),
              lineOutorga = gLines.append("path"),
              areaSvg = gLines.append("path"),
              dayStroke = gDetails.append('line'),
              endCircle = gDetails.append('circle'),
              title1 = gTexts.append('text'),
              title2 = gTexts.append('text'),
              x1AxisSvg = gAxis.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")"),
              x2AxisSvg = gAxis.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")"),
              strokeRetirada = gTexts.append('line'),
              circleRetirada = gTexts.append('circle'),
              strokeOutorga = gTexts.append('line'),
              circleOutorga = gTexts.append('circle'),
              textPrevisao = gTexts.append('text');

            scope.$watchCollection(function(scope) { return [scope.monitoramento, scope.previsoes, scope.data]; }, function(newValue) {
              if ((typeof newValue[0] !== 'undefined') && (newValue[0].volumes.length !== 0) && (typeof newValue[1] !== 'undefined') && (typeof newValue[2] !== 'undefined')) {
                draw(newValue[0], newValue[1], newValue[2]);
              }
            });

            // Get the data
            var draw = function(monitoramento, previsoes, data) {
              // Reset drawing
              lineSvg.attr('display', 'none');
              lineRetirada.attr('display', 'none');
              lineOutorga.attr('display', 'none');
              areaSvg.attr('display', 'none');
              dayStroke.attr('display', 'none');
              endCircle.attr('display', 'none');
              title1.attr('display', 'none');
              title2.attr('display', 'none');
              x1AxisSvg.attr('display', 'none');
              x2AxisSvg.attr('display', 'none');
              strokeRetirada.attr('display', 'none');
              circleRetirada.attr('display', 'none');
              strokeOutorga.attr('display', 'none');
              circleOutorga.attr('display', 'none');
              textPrevisao.attr('display', 'none');

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

              var allVolumes = [volumes, previsaoRetirada.volumesD, previsaoOutorga.volumesD];
              var min = d3.min(allVolumes.map(function(v) {
                return d3.min(v, function(d) { return d.volume; });
              }));
              var max = d3.max(allVolumes.map(function(v) {
                return d3.max(v, function(d) { return d.volume; });
              }));
              x2.domain([dataBase, d3.time.day.offset(dataBase, 180)]);
              y.domain([min, max]);

              if (volumes.length) {
                x1.domain(d3.extent(volumes, function(d) { return d.date; }));
                x1Axis.tickValues([
                  volumes[0].date,
                  volumes[volumes.length-1].date
                ]);

                lineSvg
                  .style({
                    "fill": "none",
                    "stroke-width": "1",
                    "stroke": color(regression)
                  })
                  .attr("class", "tendencia")
                  .attr("d", valueline1(volumes))
                  .attr('display', 'inline');
                areaSvg
                  .style({
                    "fill-opacity": "0.1",
                    "fill": color(regression)
                  })
                  .attr("d", valuearea(volumes))
                  .attr('display', 'inline');

                // Details
                dayStroke
                  .attr('x1', width * 0.5)
                  .attr('y1', -margin.top)
                  .attr('x2', width * 0.5)
                  .attr('y2', height + (margin.bottom * 0.5))
                  .attr('display', 'inline')
                  .style({
                    "stroke": "gray",
                    "stroke-width": "0.5",
                    "stroke-dasharray": "4,2"
                  });
                endCircle
                  .attr('cx', width * 0.5)
                  .attr('cy', y(volumes[volumes.length-1].volume))
                  .attr('r', 3)
                  .attr('display', 'inline')
                  .style({
                    "fill": color(regression)
                  });

                // Texts
                title1
                  .attr('x', width * 0.25)
                  .attr('y', -10)
                  .attr('font-size', '8px')
                  .attr('text-anchor', 'middle')
                  .text("Últimos meses")
                  .attr('display', 'inline');
                title2
                  .attr('x', width * 0.75)
                  .attr('y', -10)
                  .attr('font-size', '8px')
                  .attr('text-anchor', 'middle')
                  .text("Previsão, se não chover")
                  .attr('display', 'inline');

                x1AxisSvg.call(x1Axis).attr('display', 'inline');
              }

              if (previsaoRetirada.volumesD.length) {
                lineRetirada
                  .style({
                    "fill": "none",
                    "stroke-width": "0.8",
                    "stroke": "rgb(88, 182, 235)"
                  })
                  .attr("class", "retirada")
                  .attr("d", valueline2(previsaoRetirada.volumesD))
                  .attr('display', 'inline');
                strokeRetirada
                  .attr('x1', x2(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date))
                  .attr('y1', -margin.top)
                  .attr('x2', x2(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date))
                  .attr('y2', height + (margin.bottom * 0.5))
                  .attr('display', 'inline')
                  .style({
                    "stroke": "gray",
                    "stroke-width": "0.5",
                    "stroke-dasharray": "4,2"
                  });
                circleRetirada
                  .attr('cx', x2(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date))
                  .attr('cy',  y(previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].volume))
                  .attr('r', 3)
                  .attr('display', 'inline')
                  .style({
                    "fill": "rgb(88, 182, 235)"
                  });
                  x2Axis.tickValues([previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date]);
                  x2AxisSvg.call(x2Axis).attr('display', 'inline');
              } else {
                strokeRetirada
                  .attr('x1', width * 0.5)
                  .attr('y1', y(volumes[volumes.length-1].volume))
                  .attr('x2', width)
                  .attr('y2', height)
                  .attr('display', 'inline')
                  .style({
                    "stroke": "gray",
                    "stroke-width": "0.5",
                    "stroke-dasharray": "4,2"
                  });
                textPrevisao
                  .attr('x', width * 0.75)
                  .attr('y', height * 0.5)
                  .attr('font-size', '8px')
                  .attr('text-anchor', 'middle')
                  .attr('display', 'inline')
                  .attr('fill', 'gray')
                  .text("Dados insuficientes");
              }

              if (previsaoOutorga.volumesD.length) {
                lineOutorga
                  .style({
                    "fill": "none",
                    "stroke-width": "0.8",
                    "stroke": "rgb(67, 107, 224)"
                  })
                  .attr("class", "outorga")
                  .attr("d", valueline2(previsaoOutorga.volumesD))
                  .attr('display', 'inline');
                strokeOutorga
                  .attr('x1', x2(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date))
                  .attr('y1', -margin.top)
                  .attr('x2', x2(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date))
                  .attr('y2', height + (margin.bottom * 0.5))
                  .attr('display', 'inline')
                  .style({
                    "stroke": "gray",
                    "stroke-width": "0.5",
                    "stroke-dasharray": "4,2"
                  });
                circleOutorga
                  .attr('cx', x2(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date))
                  .attr('cy',  y(previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].volume))
                  .attr('r', 3)
                  .attr('display', 'inline')
                  .style({
                    "fill": "rgb(67, 107, 224)"
                  });
                x2Axis.tickValues([
                  previsaoRetirada.volumesD[previsaoRetirada.volumesD.length-1].date,
                  previsaoOutorga.volumesD[previsaoOutorga.volumesD.length-1].date
                ]);
                x2AxisSvg.call(x2Axis).attr('display', 'inline');
            }

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
