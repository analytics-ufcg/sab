(function() {
  'use strict';

  angular.module('sabApp')
  .directive('sabEstadoHistorico', sabEstadoHistorico);

  sabEstadoHistorico.$inject = ['$window'];

  /*jshint latedef: nofunc */
  function sabEstadoHistorico($window) {
    return {
      template: '',
      restrict: 'E',
      scope: {
        monitoramento: '=',
        volumemorto: '=',
        reservs: "="
      },
      link: function postLink(scope, element) {
        var d3 = $window.d3;

        // Set the dimensions of the canvas / graph
        var margin = {top: 35, right: 10, bottom: 80, left: 35},
        margin2 = {top: 205, right: 10, bottom: 20, left: 35},
        width = 500 - margin.left - margin.right,
        height = 255 - margin.top - margin.bottom,
        height2 = 255 - margin2.top - margin2.bottom;

        // Parse the date / time
        var parseDate = d3.time.format("%d/%m/%Y").parse,
        bisectDate = d3.bisector(function(d) { return d.date; }).left;

        var keys = ["Volume","Sem Info"];

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

        var formatTimeLiteral = localized.timeFormat("%B  de %Y");

        // Set the ranges
        var x = d3.time.scale().range([0, width]);
        var x2 = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);
        var y2 = d3.scale.linear().range([height2, 0]);
        var z = d3.scale.ordinal().range(['#22cbff','#22cbff']);
        var legendOpacity = d3.scale.ordinal().range(['0.2','0.6']);

        // Define the axes
        var xAxis = d3.svg.axis().scale(x).orient("bottom");
        var xAxisAux = d3.svg.axis().scale(x).orient("bottom");
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(2);
        var xAxis2 = d3.svg.axis().scale(x2).orient("bottom");

        // Define the lines and areas

        var valueline = d3.svg.line()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

        var valuearea = d3.svg.area()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.close); });

        var valueMiddleArea = d3.svg.area()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.close);})
        .y1(function(d) { return y(d.close+d.valueMiddle); });

        var valueMiddleline = d3.svg.line()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close+d.valueMiddle); });

        var valueTopArea = d3.svg.area()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.close+d.valueMiddle);})
        .y1(function(d) { return y(100); });

        var valueline2 = d3.svg.line()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.close); });

        var valuelinemiddle2 = d3.svg.line()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.close+d.valueMiddle); });

        var valuearea2 = d3.svg.area()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x2(d.date); })
        .y0(height2)
        .y1(function(d) { return y2(d.close); });

        var valueMiddleArea2 = d3.svg.area()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x2(d.date); })
        .y0(function(d) { return y2(d.close); })
        .y1(function(d) { return y2(d.close+d.valueMiddle); });

        var valueTopArea2 = d3.svg.area()
        .defined(function(d) { return d.close; })
        .x(function(d) { return x2(d.date); })
        .y0(function(d) { return y2(d.close+d.valueMiddle); })
        .y1(function(d) {return y2(100); });


        // Status
        var statusRect = d3.select(element[0]).append("div")
        .attr("class", "status");

        var statusDate = statusRect.append("div")
        .attr("class", "status-date")
        .html("&nbsp;");

        var statusVolume = statusRect.append("div")
        .attr("class", "status-volume")
        .html("&nbsp;");

        var statusDownload = statusRect.append("div")
          .attr("class", "status-download")
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
          svg.append("defs").append("clipPath")
          .attr("id", "clip-grafico")
          .append("rect")
          .attr("width", width)
          .attr("height", height);

          var focus = svg.append("g")
          .attr("class", "focus")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var lineInvalidosSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path line line-invalidos").attr("clip-path", "url(#clip-grafico)");

          var areaSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path area-bottom").attr("clip-path", "url(#clip-grafico)");

          var areaMiddleSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path area-middle").attr("clip-path", "url(#clip-grafico)");
          var lineMiddleSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path line-middle").attr("clip-path", "url(#clip-grafico)");
          var areaTopSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path area-top").attr("clip-path", "url(#clip-grafico)");

          var areaInvalidoSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path area-bottom area-bottom-invalidos").attr("clip-path", "url(#clip-grafico)");
          var areaMiddleInvalidoSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path area-middle area-middle-invalidos").attr("clip-path", "url(#clip-grafico)");
          var areaTopInvalidoSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path area-top area-top-invalidos").attr("clip-path", "url(#clip-grafico)");
          var lineSvg = focus.append("g")
          .append("path")
          .attr("class", "time-graph-path line").attr("clip-path", "url(#clip-grafico)");
          var xAxisSvg = focus.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")");
          var xAxisAuxSvg = focus.append("g")
          .attr("class", "x axis axis-sm")
          .attr("transform", "translate(0," + (height + 10) + ")");
          var yAxisSvg = focus.append("g")
          .attr("class", "y axis");
          yAxisSvg.append("text")
          .attr("class", "tick2")
          .attr("transform", "rotate(-90)")
          .attr("y", -33)
          .attr("x", -30)
          .attr("dy", "0.71em")
          .style("text-anchor", "end")
          .text("Volume armazenado (%)");
          var line100PercSVG = focus.append("line")
          .attr("class", "time-graph-path limit-line");
          var lineVolumeMortoSVG = focus.append("line")
          .attr("class", "time-graph-path limit-line2")
          .attr("stroke", "#ff8f61")
          .attr("display", "none");
          var textVolumeMortoSVG = focus.append("text")
          .attr("class", "tick2 fill-warning")
          .attr("text-anchor", "end")
          .attr("alignment-baseline", "after-edge")
          .attr("display", "none")
          .text("Volume morto");
          var selectedValue = focus.append("g")
          .style("display", "none");
          var selectedValueLine = selectedValue.append("line")
          .attr("class", "time-graph-path selected-value-line").attr("visibility", "hidden");
          var selectedValueCircle = selectedValue.append("circle")
          .attr("class", "time-graph-dot y")
          .attr("r", 4).attr("visibility", "hidden");
          var rectMouse = focus.append("rect")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all");


          //vertical legend
          var legend = focus.append("g")
          .attr("font-family", "sans-serif")
          .attr("fill","gray")
          .selectAll("g")
          .data(keys)
          .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });


          // // Define the div for the tooltip
          // var div = focus.append("div")
          // .attr("class", "tooltip")
          // .style("opacity", 0);


          // END Focus: Gráfico principal

          // Context: Gráfico menor, para controlar o principal
          var context = svg.append("g")
          .attr("class", "context")
          .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


          var line2InvalidosSvg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path line line-sm line-invalidos");

          var area2Svg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path area-bottom");
          var areaMiddle2Svg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path area-middle");
          var areaTop2Svg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path area-top");
          var area2InvalidoSvg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path area-bottom area-bottom-invalidos");
          var area2MiddleInvalidoSvg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path area-middle area-middle-invalidos");
          var area2TopInvalidoSvg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path area-top area-top-invalidos");
          var line2Svg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path line line-sm");
          var line2MiddleSvg = context.append("g")
          .append("path")
          .attr("class", "time-graph-path line-middle line-middle-sm");

          var xAxis2Svg = context.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height2 + ")");
          var brushHandlerLeft = context.append("g")
          .attr("class", "brush-handler");
          brushHandlerLeft.append("path")
          .attr("d", "M12,12V6V1.4C12,0.6,11.4,0,10.6,0H1.4C0.6,0,0,0.6,0,1.4V6v6v4.6C0,17.4,0.6,18,1.4,18h9.3c0.8,0,1.4-0.6,1.4-1.4V12z");
          var brush = brushHandlerLeft.append("g");
          brush.append("path")
          .attr("d", "M3.6,14.2V3.8C3.6,3.4,4,3,4.4,3h0c0.4,0,0.8,0.4,0.8,0.8v10.4c0,0.4-0.4,0.8-0.8,0.8h0 C4,15,3.6,14.6,3.6,14.2z");
          brush.append("path")
          .attr("d", "M6.8,14.2V3.8C6.8,3.4,7.2,3,7.6,3h0C8,3,8.4,3.4,8.4,3.8v10.4C8.4,14.6,8,15,7.6,15h0 C7.2,15,6.8,14.6,6.8,14.2z");
          var brushHandlerRight = context.append("g")
          .attr("class", "brush-handler");
          brushHandlerRight.append("path")
          .attr("d", "M12,12V6V1.4C12,0.6,11.4,0,10.6,0H1.4C0.6,0,0,0.6,0,1.4V6v6v4.6C0,17.4,0.6,18,1.4,18h9.3c0.8,0,1.4-0.6,1.4-1.4V12z");
          brush = brushHandlerRight.append("g");
          brush.append("path")
          .attr("d", "M3.6,14.2V3.8C3.6,3.4,4,3,4.4,3h0c0.4,0,0.8,0.4,0.8,0.8v10.4c0,0.4-0.4,0.8-0.8,0.8h0 C4,15,3.6,14.6,3.6,14.2z");
          brush.append("path")
          .attr("d", "M6.8,14.2V3.8C6.8,3.4,7.2,3,7.6,3h0C8,3,8.4,3.4,8.4,3.8v10.4C8.4,14.6,8,15,7.6,15h0 C7.2,15,6.8,14.6,6.8,14.2z");
          brush = d3.svg.brush().x(x2);
          context.append("g")
          .attr("class", "x brush")
          .call(brush)
          .selectAll("rect")
          .attr("y", -6)
          .attr("height", height2 + 7);
          // END Context: Gráfico menor, para controlar o principal


          // //tooltip
          // var div = d3.select(element[0]).append("div")
          //   .attr("class", "tooltip-area")
          //   .style("display", "none");

          scope.$watch(function(scope) { return scope.monitoramento; }, function(newValue) {
            if (typeof newValue !== 'undefined') {
              draw(newValue, scope.volumemorto);
            }
          });

          // Get the data
          var draw = function(data, volumemorto) {
            var dataValidos = [];
            data.forEach(function(d) {
              d.date = parseDate(d.DataInformacao);
              d.VolumePercentualTotal<100? d.close = d.VolumePercentualTotal: d.close = 100 ;
              d.VolumePercentualSemAgua>0? d.valueTop  = d.VolumePercentualSemAgua : d.valueTop  = 0;
              d.valueMiddle = (100 - (d.VolumePercentualTotal+d.VolumePercentualSemAgua));
              if (d.VolumePercentualTotal){
                dataValidos.push(d);
              }
            });

            focus.selectAll(".points").remove();
            focus.append("g").selectAll(".points")
            .data(dataValidos)
            .enter().append("circle")
            .attr("class", "points")
            .attr("clip-path", "url(#clip-grafico)")
            .attr("r", 1)
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.close); });




            // Scale the range of the data
            var max = d3.max(data, function(d) { return parseFloat(d.close); });
            if (max < 100) { max = 100;}
            var extent = d3.extent(data, function(d) { return d.date; });
            var months = diffMouths(extent);
            var brushExtent = extent;
            if (months > 120) {
              var endDate = data[data.length-1].date;
              var startDate = new Date(endDate);
              startDate = new Date(startDate.setMonth(startDate.getMonth() - 120));
              brushExtent = [startDate, endDate];
            }

            x.domain(extent);
            y.domain([0, max]);
            x2.domain(extent);
            y2.domain([0, max]);
            z.domain(keys);
            legendOpacity.domain(keys);

            // Add the valueline path.
            // lineSvg.attr("d", valueline(data));
            //areaSvg.attr("d", valuearea(data));
            line2Svg.attr("d", valueline2(data));
            line2MiddleSvg.attr("d", valuelinemiddle2(data));
            line2InvalidosSvg.attr("d", valueline2(dataValidos));
            area2Svg.attr("d", valuearea2(data));
            areaMiddle2Svg.attr("d", valueMiddleArea2(data));
            areaTop2Svg.attr("d", valueTopArea2(data));
            area2InvalidoSvg.attr("d", valuearea2(dataValidos));
            area2MiddleInvalidoSvg.attr("d", valueMiddleArea2(dataValidos));
            area2TopInvalidoSvg.attr("d", valueTopArea2(dataValidos));

            // Add the X Axis
            xAxisSvg.call(xAxis);
            xAxisAuxSvg.call(xAxisAux);

            xAxis2.tickFormat(localized.timeFormat('%Y'));
            if (months < 60) {
              xAxis2.ticks(d3.time.year);
            }

            xAxis2Svg.call(xAxis2);
            // Add the Y Axis
            yAxisSvg.call(yAxis);
            // Add 100% line
            line100PercSVG.attr({"x1": 0, "y1": y(100), "x2": width, "y2": y(100)});
            // Add Volume Morto line
            if (volumemorto > 0) {
              lineVolumeMortoSVG.attr({"x1": 0, "y1": y(volumemorto), "x2": width, "y2": y(volumemorto)}).attr('display', 'inline');
              textVolumeMortoSVG.attr({"x": width, "y": y(volumemorto)}).attr('display', 'inline');
            } else {
              lineVolumeMortoSVG.attr('display', 'none');
              textVolumeMortoSVG.attr('display', 'none');
            }

            // append the rectangle to capture mouse
            rectMouse
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove);

            brush.on("brush", brushed);
            brush.extent(brushExtent);
            context.select('.brush').call(brush);
            brushed();

            function xaxisTicks(months) {
              if (months <= 4) {
                return localized.timeFormat('%d');
              } else if (months > 4) {
                return localized.timeFormat('%b');
              }
            }

            function xaxisAuxTicks(months) {
              if (months <= 4) {
                return localized.timeFormat('%b');
              } else if (months > 4) {
                return localized.timeFormat('%Y');
              }
            }

            function brushed() {
              selectedValueCircle.style("visibility", "hidden");
              selectedValueLine.style("visibility", "hidden");
              if (brush.empty()) {
                x.domain(x2.domain());
                brushHandlerLeft.style("display", "none");
                brushHandlerRight.style("display", "none");
              } else {
                x.domain(brush.extent());
                var m = diffMouths(brush.extent());
                xAxis.tickFormat(xaxisTicks(m));
                xAxisAux.tickFormat(xaxisAuxTicks(m));
                brushHandlerLeft.style("display", null);
                brushHandlerRight.style("display", null);
                brushHandlerLeft.attr("transform", "translate(" + (x2(brush.extent()[0]) - 5) + "," + ((height2/6)) + ")");
                brushHandlerRight.attr("transform", "translate(" + (x2(brush.extent()[1]) - 5) + "," + ((height2/6)) + ")");
              }
              xAxisSvg.call(xAxis);
              xAxisAuxSvg.call(xAxisAux);
              lineInvalidosSvg.attr("d", valueline(dataValidos));
              areaSvg.attr("d", valuearea(data));
              areaMiddleSvg.attr("d", valueMiddleArea(data));
              areaMiddleInvalidoSvg.attr("d", valueMiddleArea(dataValidos));
             lineMiddleSvg.attr("d", valueMiddleline(data));
              areaTopSvg.attr("d", valueTopArea(data));
              areaTopInvalidoSvg.attr("d", valueTopArea(dataValidos));
              areaInvalidoSvg.attr("d", valuearea(dataValidos));
              lineSvg.attr("d", valueline(data));

              focus.selectAll(".points")
              .attr("cx", function(d) { return x(d.date); })
              .attr("cy", function(d) { return y(d.close); });
            }


            function mouseover() {
              selectedValue.style("display", null);
            }

            function setLegend(d){
              var value1 = d.close;
              var value2 = d.close + d.valueMiddle;
              var textLegend;
              // value1 === value2? textLegend = ("Volume armazenado: " + Number((d.close).toFixed(1)) +"% da capacidade (" + Math.round(d.Volume) + " hm³)" ).replace('.',','):
              //                    textLegend = ("Volume armazenado: entre " + Number((d.close).toFixed(1))  +"% e "+ Number((d.close+d.valueMiddle).toFixed(1)) +"% da capacidade (" + Math.round(d.Volume) + " hm³ - " + Math.round(d.Volume+d.CapacidadeSemInfo)+" hm³)" ).replace('.',',');

              textLegend = ("Volume armazenado: " + Number((d.close).toFixed(1)) +"% (" + Math.round(d.Volume) + " hm³)" ).replace('.',',');
              keys = [(d.quant_reservatorio_sem_info + " reservatório(s) sem informação de volume | "+Number((d.valueMiddle).toFixed(1)) + "% (" +Math.round(d.CapacidadeSemInfo)+" hm³)").replace('.',','), textLegend];
              legend.selectAll('*').remove();


              legend.append("rect")
              .attr("class", "category")
              .style("opacity", legendOpacity)
              .attr("width", 12)
              .attr("height", 12)
              .attr("x", 0)
              .attr("y", -30)
              .attr("fill", z);

              //circular legend
              // legend.append("circle")
              // .attr("class", "category")
              // .attr("r", 6)
              // .attr("cx", 0)
              // .attr("cy", -39.5)
              // .attr("fill", z);

              legend.append("text")
              .attr("class", "legend")
              .data(keys)
              .attr("x", 15)
              .attr("y", -24.5)
              .attr("dy", "0.32em")
              .text(function(d) { return d; });

              // //tooltip
              // div.style("display", "inline");
              // div.html(d.close)
              //   .style("left",(d3.event.pageX - 10)+"px")
              //   .style("top", (d3.event.pageY - height -(d.close/2))+"px");

              selectedValueCircle.style("visibility", "visible");
              selectedValueLine.style("visibility", "visible");

              statusDate.html(formatTimeLiteral(d.date));
              statusVolume.html("Total: "+d.total_reservatorios+" reservatório(s)) | " + Math.round(d.CapacidadeTotal)+" hm³");
              //statusSemInfo.html();
              selectedValueCircle.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
              selectedValueLine.attr({"x1": x(d.date), "y1": y(0), "x2": x(d.date), "y2": y(100)});

            }

            if(data[data.length-1]) setLegend(data[data.length-1]);

            function mousemove() {
              var x0 = x.invert(d3.mouse(this)[0]),
              i = bisectDate(data, x0, 1),
              d0,d1,d;

              if(data[i - 1].VolumePercentualTotal === null){
                for (var j = 1; j < data.length; j++) {
                  if(data[i-j].VolumePercentualTotal !== null){
                    d0 = data[i-j];
                    break;
                  }
                }
              }else{
                d0 = data[i-1];
              }

              if(i < data.length){
                if(data[i].VolumePercentualTotal === null){
                  for (var j = 0; j < data.length; j++) {
                    if(data[i+j].VolumePercentualTotal !== null){
                      d1 = data[i+j];
                      break;
                    }
                  }
                }else{
                  d1 = data[i];
                }
              } else{
                d1 =d0;
              }
              d = x0 - d0.date > d1.date - x0 ? d1 : d0;

              setLegend(d);

            }

            function mouseout() {

            }

            function diffMouths(extent) {
              var months;
              months = (extent[1].getFullYear() - extent[0].getFullYear()) * 12;
              months -= extent[0].getMonth() + 1;
              months += extent[1].getMonth();
              return months <= 0 ? 0 : months;
            }

          };
        }
      };
    }
  })();
