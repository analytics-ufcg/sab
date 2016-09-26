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
    vm.selectedTab = 2;
    vm.showInfo = true;
    vm.map = {
      center: {
        lat: -10.240929,
        lon: -44.231820,
        zoom: 6
      },
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
          style: semiaridoStyle()
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
          }
      }
    };
    vm.reservatoriosGeo = [];
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;
    vm.isSelectedTab = isSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.toggleInfo = toggleInfo;

    vm.reservatorios = Reservatorio.info.query();

    Reservatorio.geolocalizacao.query(function() {
      vm.reservatoriosGeo = vm.reservatoriosGeo.features;
    });

    function setReservatorio(reservatorio, lat, lon, zoom) {
      if (!(lat && lon && zoom)) {
        for (var i = 0; i < vm.reservatoriosGeo.length; i++) {
          if (vm.reservatoriosGeo[i].properties.ID == reservatorio.id) {
            lat = vm.reservatoriosGeo[i].properties.LATITUDE;
            lon = vm.reservatoriosGeo[i].properties.LONGITUDE-0.5;
            zoom = 10;
            break;
          }
        }
      }
      setZoom(lat, lon, zoom);
      vm.reservatorioSelecionado = reservatorio;
      var data = Reservatorio.monitoramento.query({id: reservatorio.id}, function() {
        vm.reservatorioSelecionado.volumes = data.volumes;
        vm.reservatorioSelecionado.volumes_recentes = data.volumes_recentes;
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

    function tamanhoReservatorio(feature) {
      var log = Math.log(feature.get("CAPACIDADE"));
      if (log <= 2) {
        return 2;
      } else {
        return log;
      }
    }

    function reservStyle() {
      return function(feature) {
        return [new ol.style.Style({
          image: new ol.style.Circle({
            radius:tamanhoReservatorio(feature),
            fill: new ol.style.Fill({ color: 'rgba(52, 152, 219, 0.6)'})
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
            vm.setReservatorioByID(feature.get('ID'), feature.get('LATITUDE'), feature.get('LONGITUDE')-0.5, 10);
          }
      });
    });

    function setZoom(lat, lon, zoom) {
      if (lat && lon && zoom) {
        vm.map.center.lat = lat;
        vm.map.center.lon = lon;
        vm.map.center.zoom = zoom;
      }
    };

  }
})();
