(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabMapa', sabMapa);

    sabMapa.$inject = ['$window'];

    /*jshint latedef: nofunc */
    function sabMapa($window) {
      return {
        template: '<div></div>',
        restrict: 'E',
        scope: {
          reservatorios: '='
        },
        link: function postLink(scope, element, attrs) {
          var
            d3 = $window.d3,
            topojson = $window.topojson,
            reservatorios = scope.reservatorios,
            width = 800,
            height = 400;
          var projection = d3.geo.mercator()
            .scale(1000)
            .translate([width * 1.6, height * 0.05]);
          var path = d3.geo.path()
            .projection(projection);
          var zoom = d3.behavior.zoom()
              .translate([0, 0])
              .scale(1)
              .scaleExtent([1, 8])
              .on("zoom", zoomed);
          var svg = d3.select(element[0])
            .append("svg")
            .attr({
              "version": "1.1",
              "viewBox": "0 0 "+width+" "+height,
              "width": "100%",
              "class": "map-svg"})
            .call(zoom);

          var features = svg.append("g").attr("id", "g-mapa");

          d3.json("http://localhost:5003/estados/br", function(error, br) {
            if (error) { return console.error(error); }

            var regioes = topojson.feature(br, br.objects.estado_sab);

            features.append("g").attr("id", "g-br")
              .append("path")
              .datum(regioes)
              .attr("class", "svg-br")
              .attr("d", path);
          });

          d3.json("http://localhost:5003/estados/sab", function(error, br) {
            if (error) { return console.error(error); }

            var limites = topojson.feature(br, br.objects.div_estadual);

            features.append("g").attr("id", "g-sab")
              .append("path")
              .datum(limites)
              .attr("class", "svg-sab")
              .attr("d", path);
          });

          var tooltip = d3.select("body")
            .append("div")
            .attr("class", "map-tooltip");

          var mouseOnEvent = function(d) {
            d3.json("http://localhost:5003/reservatorios/" + d.id + "/info", function(error, r) {

                  tooltip.html(
                    "<strong>Bacia:</strong> " + r.Bacia + "<br>" +
                    "<strong>Reservatorio:</strong> " + r.Reserv + "<br>" +
                    "<strong>Estado:</strong> " + r.Estado + "<br>" +
                    "<strong>Capacidade:</strong> " + r['Cap(hm3)']).style("visibility", "visible");
                });
                var destaque = d3.select(this);
                // transition to increase size/opacity of bubble
                destaque.transition()
                      .duration(800).style("opacity", 1);
          };

          var mouseMoveEvent = function() {
            tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
          };

          var mouseOffEvent = function() {
            var destaque = d3.select(this);
                    // transition to increase size/opacity of bubble
                    destaque.transition()
                          .duration(800).style("opacity", 0.5);

                    tooltip.style("visibility", "hidden");
          };

          var scaleCircle = function(d) {
              if (d.properties.capacidade <= 10) {
                return (1);
              } else if ((d.properties.capacidade > 10) && (d.properties.capacidade <= 100)) {
                return (1.5);
              } else if ((d.properties.capacidade > 100) && (d.properties.capacidade <= 250)) {
                return (2);
              } else if ((d.properties.capacidade > 250) && (d.properties.capacidade <= 500)) {
                return (3);
              } else if ((d.properties.capacidade > 500) && (d.properties.capacidade <= 750)) {
                return (4);
              } else if (d.properties.capacidade > 750) {
                return (5);
              }
            };

          d3.json("http://localhost:5003/reservatorios", function(error, r) {
            if (error) { return console.error(error); }

            var reservatorio = topojson.feature(r, r.objects.reservatorios_geojson);

            features.append("g").attr("id", "g-reservatorios")
              .selectAll(".reservatorio")
              .data(reservatorio.features)
              .enter()
              .append("circle")
              .attr('id', function(d) { return d.id; })
              .attr("class", "svg-reservatorio")
              .attr("cx", function(d) {
                  return projection([d.geometry.coordinates[0] , d.geometry.coordinates[1]])[0];})
              .attr("cy", function(d) {
                  return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];})
              .attr("r", scaleCircle)
              .on("mouseover", mouseOnEvent)
              .on("mousemove", mouseMoveEvent)
              .on("mouseout", mouseOffEvent);
          });

          function zoomed() {
            features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
          }
        }
      };
    }
})();
