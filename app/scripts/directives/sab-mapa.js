(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabMapa', sabMapa);

    sabMapa.$inject = ['$window','RESTAPI'];

    /*jshint latedef: nofunc */
    function sabMapa($window, RESTAPI) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          onSelectReservatorio: '&',
          reservatorioSelecionado: '=',
          infoReservatorios: '='
        },
        link: function postLink(scope, element) {
          var
            d3 = $window.d3,
            topojson = $window.topojson,
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
              .on('zoom', zoomed);
          var svg = d3.select(element[0])
            .append('svg')
            .attr({
              'version': '1.1',
              'viewBox': '0 0 '+width+' '+height,
              'width': '100%',
              'class': 'map-svg'})
            .call(zoom);

          var features = svg.append('g').attr('id', 'g-mapa');

          scope.$watch(function(scope) { return scope.reservatorioSelecionado }, function(newValue, oldValue) {
            var r = newValue.id;
            d3.selectAll(".svg-reservatorio").attr("class", "svg-reservatorio");
            var point = d3.select("#r"+r).attr("class", "svg-reservatorio svg-reservatorio-highlight");
            // console.log(point);
            // var x = (800 - point.attr('cx'))* 1.6;
            // var y = (400 - point.attr('cy'))* 0.05;
            // d3.select("#g-mapa").transition().duration(300).ease("linear").attr("transform", "translate("+x+","+y+")");
          });

          var mouseOnEvent = function(d) {
            scope.onSelectReservatorio()(d.properties.ID);
            scope.$apply();
          };

          var scaleCircle = function(d) {
                for (var i = 0; i < scope.infoReservatorios.length; i++) {
                  if(parseInt(d.properties.ID) === parseInt(scope.infoReservatorios[i].id)){
                  console.log(scope.infoReservatorios[i]);
                    if (scope.infoReservatorios[i].capacidade <= 10) {
                      return (0.5);
                    } else if ((scope.infoReservatorios[i].capacidade > 10) && (scope.infoReservatorios[i].capacidade <= 100)) {
                      return (1.0);
                    } else if ((scope.infoReservatorios[i].capacidade > 100) && (scope.infoReservatorios[i].capacidade <= 250)) {
                      return (1.5);
                    } else if ((scope.infoReservatorios[i].capacidade > 250) && (scope.infoReservatorios[i].capacidade <= 500)) {
                      return (2);
                    } else if ((scope.infoReservatorios[i].capacidade > 500) && (scope.infoReservatorios[i].capacidade <= 750)) {
                      return (3);
                    } else if (scope.infoReservatorios[i].capacidade > 750) {
                      return (4);
                    } else{
                      return(10);
                    }
                  }
                }
                //return(2);
            };

          function zoomed() {
            features.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
          }

          function mapaBrasil(br){
            var brasil = topojson.feature(br, br.objects.estados_brasil);

            features.append('g').attr('id', 'g-br')
              .append('path')
              .datum(brasil)
              .attr('class', 'svg-br')
              .attr('d', path);
          }

          function mapaSemiArido(sab){
            var semiarido = topojson.feature(sab, sab.objects.div_estadual);

            features.append('g').attr('id', 'g-sab')
              .append('path')
              .datum(semiarido)
              .attr('class', 'svg-sab')
              .attr('d', path);
          }

          function mapaReservatorios(reserv){
            var reservatorio = topojson.feature(reserv, reserv.objects.reservatorios);

            features.append('g').attr('id', 'g-reservatorios')
              .selectAll('.reservatorio')
              .data(reservatorio.features)
              .enter()
              .append('circle')
              .attr('id', function(d) { return "r"+d.properties.ID; })
              .attr('class', 'svg-reservatorio')
              .attr('cx', function(d) {
                  return projection([d.geometry.coordinates[0] , d.geometry.coordinates[1]])[0];})
              .attr('cy', function(d) {
                  return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];})
              .attr('r', scaleCircle)
              .on('click', mouseOnEvent);
          }

          d3.queue()
            .defer(d3.json, RESTAPI.url + '/estados/br')
            .defer(d3.json, RESTAPI.url + '/estados/sab')
            .defer(d3.json, RESTAPI.url + '/reservatorios')
            .await(desenhaMapa);

          function desenhaMapa(error, br, sab, reserv) {
            if (error) { return console.error(error); }
            mapaBrasil(br);
            mapaSemiArido(sab);
            mapaReservatorios(reserv);
          }
        }
      };
    }
})();
