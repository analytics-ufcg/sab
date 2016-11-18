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


    var margin = {top: 0, right: 1, bottom: 0, left: 0},
            width = 300 - margin.left - margin.right,
            height = 30 - margin.top - margin.bottom;

    var x = d3.scale.linear()
            .rangeRound([0, width]);

    var y = d3.scale.linear()
            .rangeRound([height, 0]);

    var color = d3.scale.category20();

    var svg = d3.select(element[0])
            .append('svg')
            .attr({
              'version': '1.1',
              'viewBox': '0 0 '+(width+ margin.left + margin.right)+' '+height,
              'width': '100%',
              'class': 'recorte-sab-svg'});

    var div = d3.select(element[0]).append("div")
      .attr("class", "tooltip-barra")
      .style("display", "none");

    scope.$watch(function(scope) { return scope.infoEstado; }, function(newValue) {
      if ((typeof newValue !== 'undefined') && !(angular.equals(newValue, {}))) {
        desenhaBarra(newValue);
      }
    });

    var desenhaBarra = function(mapData) {
      var dataIntermediate = [[{x:mapData.quant_reserv_intervalo_1, x0:0, cor: scope.cores[0].cor, legenda: scope.cores[0].texto}],
        [{x:mapData.quant_reserv_intervalo_2, x0:mapData.quant_reserv_intervalo_1, cor: scope.cores[1].cor, legenda: scope.cores[1].texto}],
        [{x:mapData.quant_reserv_intervalo_3, x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2), cor: scope.cores[2].cor,
         legenda: scope.cores[2].texto}],
        [{x:mapData.quant_reserv_intervalo_4, x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2+mapData.quant_reserv_intervalo_3),
         cor: scope.cores[3].cor, legenda: scope.cores[3].texto}],
        [{x:mapData.quant_reserv_intervalo_5, 
          x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2+mapData.quant_reserv_intervalo_3+mapData.quant_reserv_intervalo_4),
           cor: scope.cores[4].cor, legenda: scope.cores[4].texto}]];

    /*,
        [{x:mapData.quant_reservatorio_sem_info, 
          x0:(mapData.quant_reserv_intervalo_1+mapData.quant_reserv_intervalo_2+mapData.quant_reserv_intervalo_3+
          mapData.quant_reserv_intervalo_4+mapData.quant_reserv_intervalo_5),
           cor: scope.cores[5].cor}]*/
      
      var dataStackLayout = d3.layout.stack()(dataIntermediate);

      x.domain([0,mapData.quant_reservatorio_com_info]);

      svg.selectAll("*").remove();

      var layer = svg.selectAll(".stack")
              .data(dataStackLayout)
              .enter().append("g")
              .attr("class", "stack")
              .attr("transform", 'translate('+margin.right+','+margin.top+')')
              .style("fill", function (d) {
                  return d[0].cor;
              })
              .on("mouseover", function(d){
                    div.style("display", "inline");
                    div.html("Volume "+d[0].legenda+"%<br>"+(d[0].x) +" reservatorios<br>"
                         + ((d[0].x/mapData.quant_reservatorio_com_info) * 100).toFixed(2) +"% de reservatórios")
                      .style("left", (x(d[0].x0)+ (x(d[0].x)/4)) + "px");
              })
              .on("mouseout", function(){
                div.style("display", "none");
              });

      layer.selectAll("rect")
              .data(function (d) {
                  return d;
              })
              .enter().append("rect")
              .attr("x", function (d) {
                  return x(d.x0);
              })
              .attr("height", height)
              .attr("width", function (d) {
                  return x(d.x);
              })



            }
        
        }
    };
    }
})();