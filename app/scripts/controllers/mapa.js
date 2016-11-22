(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MapaCtrl', MapaCtrl);

  MapaCtrl.$inject = ['$scope', 'Reservatorio', 'RESTAPI','olData'];

  /*jshint latedef: nofunc */
  function MapaCtrl($scope, Reservatorio, RESTAPI, olData) {
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
    vm.showSearchbar = false;
    vm.showLegend = false;

    var larguraTela = $(window).width();

    if( larguraTela <= 1000 ) {
      vm.zoomInicial = 5;
      vm.latitude = -9.4044477;
      vm.longitude = -40.507917;
    } else {
      vm.zoomInicial = 6;
      vm.latitude = -10.240929;
      vm.longitude = -44.231820;
    }


    vm.map = {
      center: {
        lat: vm.latitude,
        lon: vm.longitude,
        zoom: vm.zoomInicial
      },
      markers: [],
      layers: [
        {
          name: 'TileMap',
          active: true,
          source: {
            type: 'MapBoxStudio',
            mapId: 'citep6zo000242inxhqdd19p2',
            userId: 'jeffersonrpn',
            accessToken: 'pk.eyJ1IjoiamVmZmVyc29ucnBuIiwiYSI6ImNpcnZhc2FoMTBpZGtmYW04M3IyZTZ6NWoifQ.xTtlY-a--vOAS25Op_7uIA'
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
          },
          controls: {
              zoom: false,
              rotate: false,
              attribution: false
          },
          interactions: {
              mouseWheelZoom: true
          },
          view: {
              maxZoom: 16,
              minZoom: 4
          }
      }
    };
    vm.reservatoriosGeo = [];
    vm.coresReservatorios = [
      {cor: '#ff2222', texto: 'Abaixo de 10%'},
      {cor: '#ff8f61', texto: '10% - 25%'},
      {cor: '#fffc9f', texto: '25% - 50%'},
      {cor: '#99bfcf', texto: '50% - 75%'},
      {cor: '#3381ff', texto: 'Acima de 75%'},
      {cor: '#ffffff', texto: 'Sem informação'}
    ];
    vm.setReservatorio = setReservatorio;
    vm.setReservatorioByID = setReservatorioByID;
    vm.isSelectedTab = isSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.toggleInfo = toggleInfo;
    vm.hideInfo = hideInfo;
    vm.toggleSearchbar = toggleSearchbar;
    vm.toggleLegend = toggleLegend;

    vm.reservatorios = Reservatorio.info.query();

    vm.reservatoriosGeo = Reservatorio.geolocalizacao.query(function() {
      vm.reservatoriosGeo = vm.reservatoriosGeo.features;
      vm.loadingMap = false;
    });

    function setReservatorio(reservatorio, lat, lon, zoom) {
      vm.loadingInfo = true;
      vm.showInfo = true;
      vm.showSearchbar = false;
      vm.showLegend = false;
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

      efeitoZoom(lat, lon, zoom);
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

    function toggleSearchbar() {
      vm.showSearchbar = !vm.showSearchbar;
    }

    function toggleLegend() {
      vm.showLegend = !vm.showLegend;
    }

    function hideInfo() {
      vm.showInfo = false;
    }

    function tamanhoReservatorio(feature, zoom) {
      // Esse 1.8 é para tirar a diferença do zoomInicial com o log(zoom);
      var tamanho = Math.abs(Math.log(feature.get("capacidade")))+(vm.zoomInicial+1.8) - Math.log(zoom);
      if (tamanho < 2){
        tamanho = 2;
      }
      return tamanho;

    }

    function corReservatorio(feature) {
      if(feature.get("volume_percentual") == null) {
        return new ol.style.Fill({ color: vm.coresReservatorios[5].cor});
      } else{
        var volume_percentual = parseFloat(feature.get("volume_percentual"));

        if (volume_percentual  <= 10){
          return new ol.style.Fill({ color: vm.coresReservatorios[0].cor});
        }else if (volume_percentual <= 25){
          return new ol.style.Fill({ color: vm.coresReservatorios[1].cor});
        } else if (volume_percentual <= 50){
          return new ol.style.Fill({ color: vm.coresReservatorios[2].cor});
        } else if (volume_percentual <= 75){
          return new ol.style.Fill({ color: vm.coresReservatorios[3].cor});
        } else{
          return new ol.style.Fill({ color: vm.coresReservatorios[4].cor});
        }
      }

    }

    function reservStyle() {
      return function(feature, zoom) {
        return [new ol.style.Style({
          image: new ol.style.Circle({
            radius:tamanhoReservatorio(feature, zoom),
            fill: corReservatorio(feature)
          })
        })];
      };
    }

    function semiaridoStyle() {
      return new ol.style.Style({
        fill: new ol.style.Fill({color: "rgba(0, 0, 0, 0.1)"})
      });
    }

    $scope.$on('openlayers.layers.reservatorios.click', function(event, feature) {
      $scope.$apply(function(scope) {
          if(feature) {
            vm.setReservatorioByID(feature.get('id'), parseFloat(feature.get('latitude')), parseFloat(feature.get('longitude')), 10);
          }
      });
    });

    function efeitoZoom(lat, lon, zoom) {
      larguraTela = $(window).width();
      var latMais = 0;
      var lonMais = 0;

      if(larguraTela < 1600 && larguraTela > 1000){
        lonMais = -0.4;
      } else if( larguraTela <= 1000 ) {
        latMais = -0.2;
      }

      var reservatorio = ol.proj.fromLonLat([lon + lonMais,lat + latMais]);
      olData.getMap().then(function(map) {
        var bounce = ol.animation.bounce({
            resolution: 750,
            duration: 2000
          });
        var pan = ol.animation.pan({
            duration: 2000,
            source: map.getView().getCenter()
          });
        map.beforeRender(pan, bounce);
        map.getView().setCenter(reservatorio);
        map.getView().setZoom(zoom);
      });
    }

  }
})();
