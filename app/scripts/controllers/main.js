(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'Reservatorio', 'RESTAPI'];

  /*jshint latedef: nofunc */
  function MainCtrl($scope, Reservatorio, RESTAPI) {
    var vm = this;
    vm.reservatorios = [];
    vm.reservatorioSelecionado = {
      nome: "",
      volumes: []
    };
    vm.selectedTab = 1;
    vm.showInfo = true;
    vm.loadingMap = true;
    vm.loadingInfo = true;

    vm.map = {
      center: {
        lat: -10.240929,
        lon: -44.231820,
        zoom: 6
      },
      markers: [],
      layers: [
        {
          name: 'OpenCycleMap',
          active: false,
          source: {
            type: 'OSM',
            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
            attribution: 'All maps &copy; <a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
          }
        },
        {
          name: 'semiarido',
          source: {
            type: 'GeoJSON',
            url: RESTAPI.url+'/estados/sab'
          },
          style: semiaridoStyle(6)
        },
        {
          name: 'reservatorios',
          source: {
            type: 'GeoJSON',
            url: RESTAPI.url+'/reservatorios'
          },
          style: reservStyle()
        }
      ],
      defaults: {
          events: {
              layers: [ 'mousemove', 'click' ]
          },
          controls: {
              zoom: false,
              rotate: false,
              attribution: false
          },
          interactions: {
              mouseWheelZoom: true
          }
      }
    };
    vm.reservatoriosGeo = [];
    vm.coresReservatorios = [
      {cor: '#a50026', texto: 'Colapso'},
      {cor: '#d73027', texto: 'Crítico'},
      {cor: '#74add1', texto: 'Normal'},
      {cor: '#4575b4', texto: 'Cheio'},
      {cor: '#313695', texto: 'Em Vertimento'},
      {cor: '#9a999e', texto: 'Sem informação'}
    ];
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;
    vm.isSelectedTab = isSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.toggleInfo = toggleInfo;

    vm.reservatorios = Reservatorio.info.query();

    vm.reservatoriosGeo = Reservatorio.geolocalizacao.query(function() {
      vm.reservatoriosGeo = vm.reservatoriosGeo.features;

      vm.loadingMap = false;
    });

    function setReservatorio(reservatorio, lat, lon, zoom) {
      vm.loadingInfo = true;
      if (!(lat && lon && zoom)) {
        for (var i = 0; i < vm.reservatoriosGeo.length; i++) {
          if (vm.reservatoriosGeo[i].properties.id == reservatorio.id) {
            lat = parseFloat(vm.reservatoriosGeo[i].properties.latitude);
            lon = parseFloat(vm.reservatoriosGeo[i].properties.longitude);
            zoom = 10;
            break;
          }
        }
      }

      vm.map.markers = [{
        lat: lat,
        lon: lon
      }];

      setZoom(lat, lon, zoom);
      vm.reservatorioSelecionado = reservatorio;
      var data = Reservatorio.monitoramento.query({id: reservatorio.id}, function() {
        vm.reservatorioSelecionado.volumes = data.volumes;
        vm.reservatorioSelecionado.volumes_recentes = data.volumes_recentes;

        vm.loadingInfo = false;

      });
    }

    function setReservatorioByID(id, lat, lon, zoom) {
      for (var i = 0; i < vm.reservatorios.length; i++) {
        if (parseInt(vm.reservatorios[i].id) === id) {
          setReservatorio(vm.reservatorios[i], lat, lon, zoom);
          break;
        }
      }
    }

    function isSelectedTab(tab) {
      return vm.selectedTab === tab;
    }

    function setSelectedTab(tab) {
      vm.selectedTab = tab;
    }

    function toggleInfo() {
      vm.showInfo = !vm.showInfo;
    }

    function tamanhoReservatorio(feature, zoom) {
      console.log(zoom);
      // console.log(Math.log(zoom));
      // var log =
      return Math.abs(Math.log(feature.get("capacidade")));
      // var menor = 2;
      // // 155 porque sim
      // if (zoom <= 155) {
      //   log = log*3;
      //   menor = 5;
      // }
      // if (log <= menor) {
      //   return menor;
      // } else {
      //   return log;
      // }

    }

    function corReservatorio(feature) {
      if(feature.get("volume_percentual") == null){
        return new ol.style.Fill({ color: vm.coresReservatorios[5].cor});
      } else{
        var volume_percentual = parseFloat(feature.get("volume_percentual"));

        if (volume_percentual == 0){
          return new ol.style.Fill({ color: vm.coresReservatorios[0].cor});
        }else if (volume_percentual <= 10){
          return new ol.style.Fill({ color: vm.coresReservatorios[1].cor});
        } else if (volume_percentual < 100){
          return new ol.style.Fill({ color: vm.coresReservatorios[2].cor});
        } else if (volume_percentual == 100){
          return new ol.style.Fill({ color: vm.coresReservatorios[3].cor});
        } else{
          return new ol.style.Fill({ color: vm.coresReservatorios[4].cor});
        }
      }

    }

    function reservStyle(teste) {
      return function(feature, teste) {
        return [new ol.style.Style({
          image: new ol.style.Circle({
            radius:tamanhoReservatorio(feature, teste),
            fill: corReservatorio(feature)
          })
        })];
      };
    }

    function semiaridoStyle() {
      return new ol.style.Style({
        fill: new ol.style.Fill({color: "rgba(255, 255, 255, 0.3)"}),
        stroke: new ol.style.Stroke({color: "rgba(230, 126, 34, 1)"})
      });
    }

    $scope.$on('openlayers.layers.reservatorios.click', function(event, feature) {
      $scope.$apply(function(scope) {
          if(feature) {
            vm.setReservatorioByID(feature.get('id'), parseFloat(feature.get('latitude')), parseFloat(feature.get('longitude')), 10);
          }
      });
    });

    function setZoom(lat, lon, zoom) {

      var latMais = 0;
      var lonMais = 0;

      var larguraTela = $(window).width();

      if(larguraTela < 1600 && larguraTela > 1000){
        lonMais = -0.4;
      } else if( larguraTela <= 1000 ) {
        latMais = -0.2;
      }

      if (lat && lon && zoom) {
        vm.map.center.lat = lat + latMais;
        vm.map.center.lon = lon + lonMais;
        vm.map.center.zoom = zoom;
      }
      vm.map.layers[2].style = reservStyle(zoom);

    };

  }
})();
