(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabReservatorioHistorico', sabReservatorioHistorico);

    sabReservatorioHistorico.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabReservatorioHistorico($window) {
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
            var margin = {top: 5, right: 5, bottom: 80, left: 25},
                margin2 = {top: 200, right: 5, bottom: 20, left: 25},
                width = 500 - margin.left - margin.right,
                statusHeight = 25,
                height = 250 - margin.top - margin.bottom,
                height2 = 250 - margin2.top - margin2.bottom;

            // Parse the date / time
            var parseDate = d3.time.format("%d/%m/%Y").parse,
                bisectDate = d3.bisector(function(d) { return d.date; }).left;

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

            var formatTime = d3.time.format("%d/%m/%Y");
            var formatTimeLiteral = localized.timeFormat("%d de %B  de %Y");

            var customTimeFormat = d3.time.format.multi([
              ["%m", function(d) { return d.getMonth(); }],
              ["%Y", function() { return true; }]
            ]);

            // Set the ranges
            var x = d3.time.scale().range([0, width]);
            var x2 = d3.time.scale().range([0, width]);
            var y = d3.scale.linear().range([height, 0]);
            var y2 = d3.scale.linear().range([height2, 0]);

            // Define the axes
            var yAxis = d3.svg.axis().scale(y).orient("left").ticks(2);
            var xAxis2 = d3.svg.axis().scale(x2).orient("bottom");
            var yAxis2 = d3.svg.axis().scale(y2).orient("left").ticks(2);

            var brush = d3.svg.brush().x(x2);

            // Define the line
            var valueline = d3.svg.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.close); });
            var valuearea = d3.svg.area()
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y(d.close); });
            var valueline2 = d3.svg.line()
                .x(function(d) { return x2(d.date); })
                .y(function(d) { return y2(d.close); });
            var valuearea2 = d3.svg.area()
                .x(function(d) { return x2(d.date); })
                .y0(height2)
                .y1(function(d) { return y2(d.close); });

            // Define the div for the tooltip
            var div = d3.select(element[0]).append("div")
                .attr("class", "time-graph-tooltip")
                .style("display", "none");

            // Status
            var statusRect = d3.select(element[0]).append("div")
              .attr("class", "status")
            var statusDate = statusRect.append("div")
              .attr("class", "status-date")
              .html("&nbsp;");
            var statusVolume = statusRect.append("div")
              .attr("class", "status-volume")
              .html("&nbsp;");

            // Adds the svg canvas
            var svg = d3.select(element[0])
                .append("svg")
                .attr({
                  'version': '1.1',
                  'viewBox': '0 0 '+(width + margin.left + margin.right)+' '+(height + margin.top + margin.bottom),
                  'width': '100%',
                  'class': 'time-graph'});

            // Focus: Gráfico principal
            var focus = svg.append("g")
              .attr("class", "focus")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var lineSvg = focus.append("g")
              .append("path")
              .attr("class", "time-graph-path line");
            var areaSvg = focus.append("g")
              .append("path")
              .attr("class", "time-graph-path area");
            var xAxisSvg = focus.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");
            var yAxisSvg = focus.append("g")
                .attr("class", "y axis");
            var line100PercSVG = focus.append("line")
              .attr("class", "time-graph-path limit-line");
            var selectedValue = focus.append("g")
                .style("display", "none");
            var selectedValueLine = selectedValue.append("line")
            .attr("class", "time-graph-path selected-value-line");
            var selectedValueCircle = selectedValue.append("circle")
                .attr("class", "time-graph-dot y")
                .attr("r", 4);
            var rectMouse = focus.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all");
            // END Focus: Gráfico principal

            // Context: Gráfico menor, para controlar o principal
            var context = svg.append("g")
              .attr("class", "context")
              .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
            var line2Svg = context.append("g")
              .append("path")
              .attr("class", "time-graph-path line line-sm");
            var area2Svg = context.append("g")
              .append("path")
              .attr("class", "time-graph-path area");
            var xAxis2Svg = context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height2 + ")");
            context.append("g")
              .attr("class", "x brush")
              .call(brush)
            .selectAll("rect")
              .attr("y", -6)
              .attr("height", height2 + 7);
            // END Context: Gráfico menor, para controlar o principal

            svg.append("defs").append("clipPath")
              .attr("id", "clip")
            .append("rect")
              .attr("width", width)
              .attr("height", height);

            scope.$watch(function(scope) { return scope.monitoramento }, function(newValue, oldValue) {
              if (typeof newValue != 'undefined') {
                draw(newValue);
              }
            });

            // Get the data
            var draw = function(data) {

              data.forEach(function(d) {
                d.date = parseDate(d.DataInformacao);
                d.close = +d.VolumePercentual;
              });
              data.sort(function(a, b) {
                  return a.date - b.date;
              });

              // Scale the range of the data
              var max = d3.max(data, function(d) { return d.close; });
              if (max < 100) { max = 100;}
              var extent = d3.extent(data, function(d) { return d.date; });
              var months = diffMouths(extent);
              if (months > 120) {
                var endDate = data[data.length-1].date;
                var startDate = new Date(endDate);
                startDate = new Date(startDate.setMonth(startDate.getMonth() - 120));
                var brushExtent = [startDate, endDate];
              } else {
                var brushExtent = extent;
              }

              x.domain(extent);
              y.domain([0, max]);
              x2.domain(extent);
              y2.domain([0, max]);

              var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(customTimeFormat);

              // Add the valueline path.
              lineSvg.attr("d", valueline(data));
              areaSvg.attr("d", valuearea(data));
              line2Svg.attr("d", valueline2(data));
              area2Svg.attr("d", valuearea2(data));
              // Add the X Axis
              xAxisSvg.call(xAxis);
              xAxis2Svg.call(xAxis2);
              // Add the Y Axis
              yAxisSvg.call(yAxis);
              // Add 100% line
              line100PercSVG.attr({"x1": 0, "y1": y(100), "x2": width, "y2": y(100)});

              // append the rectangle to capture mouse
              rectMouse
                  .on("mouseover", mouseover)
                  .on("mouseout", mouseout)
                  .on("mousemove", mousemove);

              brush.on("brush", brushed);
              brush.extent(brushExtent);
              context.select('.brush').call(brush);
              brushed();

              function brushed() {
                x.domain(brush.empty() ? x2.domain() : brush.extent());
                xAxisSvg.call(xAxis);
                lineSvg.attr("d", valueline(data));
                areaSvg.attr("d", valuearea(data));
              }

              function mouseover() {
                statusRect.style("visibility", "visible");
                selectedValue.style("display", null);
              }

              function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]),
            		    i = bisectDate(data, x0, 1),
            		    d0 = data[i - 1],
            		    d1 = data[i],
            		    d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                statusDate.html(formatTimeLiteral(d.date));
                statusVolume.html(Number((d.close).toFixed(2)) + "%"+" | "+d.Volume+" hm³");
                selectedValueCircle.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
                selectedValueLine.attr({"x1": x(d.date), "y1": y(max), "x2": x(d.date), "y2": y(0)});
            	}

              function mouseout() {
                statusRect.style("visibility", "hidden");
                selectedValue.style("display", "none");
              }

            function diffMouths(extent) {
              var months;
                  months = (extent[1].getFullYear() - extent[0].getFullYear()) * 12;
                  months -= extent[0].getMonth() + 1;
                  months += extent[1].getMonth();
              return months <= 0 ? 0 : months;
            }

            function getTimeScaleTicksUnit(mouths) {
              if (months < 24) {
                // Para menos de 2 anos, exibe todos os meses
                return d3.time.month;
              } else {
                // Para mais de 10 anos, exibe a cada 2 anos
                return d3.time.year;
              };
            }

            function getTimeScaleTicksInterval(mouths) {
              if (months < 24) {
                // Para menos de 2 anos, exibe todos os meses
                return 1;
              } else if (months >= 24 && months < 120) {
                // Para ate 10 anos, exibe anualmente
                return 1;
              } else {
                // Para mais de 10 anos, exibe a cada 2 anos
                return 2;
              };
            }

          }
        }
      }
    }
})();
