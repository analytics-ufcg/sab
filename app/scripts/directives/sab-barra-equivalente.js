(function() {
  'use strict';

  angular.module('sabApp')
    .directive('sabBarraEquivalente', sabBarraEquivalente);

    sabBarraEquivalente.$inject = ['$window','RESTAPI'];

    /*jshint latedef: nofunc */
    function sabBarraEquivalente($window, RESTAPI) {
      return {
        template: '',
        restrict: 'E',
        scope: {
          infoEstado: '=',
          cores: '='
        },
        link: function postLink(scope, element) {


    var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 300 - margin.left - margin.right,
            height = 50 - margin.top - margin.bottom;

    var x = d3.scale.linear()
            .rangeRound([0, width]);

    var y = d3.scale.linear()
            .rangeRound([height, 0]);

    var color = d3.scale.category20();

    var svg = d3.select(element[0])
            .append('svg')
            .attr({
              'version': '1.1',
              'viewBox': '0 0 '+width+' '+height,
              'width': '100%',
              'class': 'recorte-sab-svg'});

    scope.$watch(function(scope) { return scope.infoEstado; }, function(newValue) {
      if ((typeof newValue !== 'undefined') && !(angular.equals(newValue, {}))) {
        desenhaBarra(newValue);
      }
    });

    var desenhaBarra = function(mapData) {
      var dataIntermediate = [[{x:mapData.quant_reserv_intervalo_1, x0:1}],
        [{x:mapData.quant_reserv_intervalo_2, x0:mapData.quant_reserv_intervalo_1}],
        [{x:mapData.quant_reserv_intervalo_3, x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2)}],
        [{x:mapData.quant_reserv_intervalo_4, x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2+mapData.quant_reserv_intervalo_3)}],
        [{x:mapData.quant_reserv_intervalo_5, 
          x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2+mapData.quant_reserv_intervalo_3+mapData.quant_reserv_intervalo_4)}],
        [{x:mapData.quant_reservatorio_sem_info, 
          x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2+mapData.quant_reserv_intervalo_3+mapData.quant_reserv_intervalo_4+mapData.quant_reserv_intervalo_5)}]];
      
      var dataStackLayout = d3.layout.stack()(dataIntermediate);

      x.domain([0,mapData.total_reservatorios]);

      svg.selectAll("*").remove();

      var layer = svg.selectAll(".stack")
              .data(dataStackLayout)
              .enter().append("g")
              .attr("class", "stack")
              .style("fill", function (d, i) {
                  return scope.cores[i].cor;
              }).style("stroke","#000");

      layer.selectAll("rect")
              .data(function (d) {
                  return d;
              })
              .enter().append("rect")
              .attr("x", function (d) {
                console.log(d);
                  return x(d.x0);
              })
              .attr("height", height)
              .attr("width", function (d) {
                  return x(d.x);
              });

            }
        
        }
    };
    }
})();