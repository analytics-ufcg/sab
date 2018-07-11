(function() {
  'use strict';

  angular.module('sabApp')
    .controller('MapaCtrl', MapaCtrl);

  MapaCtrl.$inject = ['$scope', 'Reservatorio', 'RESTAPI','LEGENDCOLORS', 'olData', '$location'];

  /*jshint latedef: nofunc */
  function MapaCtrl($scope, Reservatorio, RESTAPI, LEGENDCOLORS, olData, $location) {
    var vm = this;
    vm.reservatorios = [];
    vm.municipios = [];
    vm.municipioSelecionado = {};
    vm.reservatorioSelecionado = {};
    vm.selectedTab = 1;
    vm.selectedMapType = 0;
    vm.showInfo = true;
    vm.loadingMap = true;
    vm.loadingInfo = true;
    vm.showSearchbar = false;
    vm.showLegend = false;
    vm.showShare = false;
    vm.gotError = false;
    vm.RESTAPI = RESTAPI;
    vm.municipioReservatorio = [];

    // Variáveis para compartilhamento
    vm.share = {
      appID: RESTAPI.facebookAppID,
      title: "",
      longText: "",
      shortText: "",
      url: "",
      media: ""
    }
    vm.copyTooltipText = "";
    vm.copyUrl = copyUrl;
    vm.resetCopyUrl = resetCopyUrl;

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

    var semiaridoStyleEstado = function(feature) {
        var style;
        const uf = $location.search().uf;
        style = new ol.style.Style({
          fill: uf === feature.getId()?
                  new ol.style.Fill({ color:"rgba(16, 84, 125, 1)"}) :
                  new ol.style.Fill({color: "rgba(12, 137, 193, 0.8)"}),
          stroke: new ol.style.Stroke({color: "rgba(16, 84, 125, 1)"})
        });
        feature.setStyle(style);
        if (previousFeature && feature !== previousFeature) {
          previousFeature.setStyle(null);
        }
        previousFeature = feature;
        return style;
    };


    vm.map = {
      center: {
        lat: vm.latitude,
        lon: vm.longitude,
        zoom: vm.zoomInicial
      },
      markers_reserv: [],
      markers_municipio: [],
      layers: [
        {
          name: 'EstadosMap',
          active: true,
          visible: true,
          source: {
            type:"MapBoxStudio",
            mapId:"cjgz3yuzu000j2rs5opg4x7g2",
            userId:"diegocoelhoinsa",
            accessToken:"pk.eyJ1IjoiZGllZ29jb2VsaG9pbnNhIiwiYSI6ImNqZ3ozdTJnMDBpcmEyeG50YjEzY2l2dTQifQ.baZTq3TNsn9zqxzvDY1P8Q"
          }
        },
        {
          name: 'Semiarido',
          visible: true,
          source: {
            type: 'TopoJSON',
            url: RESTAPI.url+'/estados/sab'
          },
          style: semiaridoStyle()
        },
        {
          name: 'SemiaridoDark',
          visible: false,
          source: {
            type: 'TopoJSON',
            url: RESTAPI.url+'/estados/sab'
          },
          style: semiaridoStyleEstado
        }
      ],
      defaults: {
          events: {
              map: ['pointermove', 'mousemove', 'click'],
              layers: [ 'mousemove', 'click']
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
    vm.cityMarkerStyle = {
      image: {
          icon: {
              anchor: [0.5, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              opacity: 1,
              src: 'images/city-marker.png'
          }
      }
    };
    vm.waterMarkerStyle = {
      image: {
          icon: {
              anchor: [0.5, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              opacity: 1,
              src: 'images/water-marker.png'
          }
      }
    };
    vm.reservatoriosGeo = [];
    vm.estadoEquivalente = [];
    vm.estadoAtual = {};
    var previousFeature;

    vm.coresReservatorios = LEGENDCOLORS.reservoirsColors;

    vm.setReservatorio = setReservatorio;
    vm.isSelectedTab = isSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.isSelectedMapType = isSelectedMapType;
    vm.setSelectedMapType = setSelectedMapType;
    vm.toggleInfo = toggleInfo;
    vm.hideInfo = hideInfo;
    vm.toggleSearchbar = toggleSearchbar;
    vm.toggleLegend = toggleLegend;
    vm.setEstado = setEstado;
    vm.efeitoZoom = efeitoZoom;
    vm.toggleShare = toggleShare;
    vm.setMunicipio = setMunicipio;
    vm.setReservatorioMunicipio = setReservatorioMunicipio;

    function init() {
      Reservatorio.info.query(function(data) {
        vm.reservatorios = data;
        if (Number.isInteger(parseInt($location.search().id)) && vm.reservatoriosGeo.length) {
          vm.setReservatorio(parseInt($location.search().id));
        }
      });

      Reservatorio.municipioReservatorio.query(function(data) {
        vm.municipioReservatorio = data;
      });

      Reservatorio.municipios.query(function(data) {
        vm.municipios = data;
      });

      Reservatorio.geolocalizacao.query(function(data) {
        vm.reservatoriosGeo = data.features;
        if (Number.isInteger(parseInt($location.search().id)) && vm.reservatorios.length) {
          vm.setReservatorio(parseInt($location.search().id));
        }
        vm.map.layers.push({
          name: 'reservatorios',
          source: {
            type: 'GeoJSON',
            geojson: {
                projection: "EPSG:4326",
                object: data
            }
          },
          style: reservStyle(),
          opacity: 1
        });

        vm.loadingMap = false;
      }, function(error) {
        vm.loadingMap = false;
        vm.gotError = true;
      });
      vm.resetCopyUrl();
    }
    init();

    function setReservatorio(id) {
      vm.loadingInfo = true;
      vm.showInfo = true;
      vm.showSearchbar = false;
      vm.showLegend = false;

      for (var i = 0; i < vm.reservatorios.length; i++) {
        if (parseInt(vm.reservatorios[i].id) === id) {
          vm.reservatorioSelecionado = vm.reservatorios[i];
          break;
        }
      }
      if (vm.reservatorioSelecionado.id) {
        for (var i = 0; i < vm.reservatoriosGeo.length; i++) {
          if (vm.reservatoriosGeo[i].properties.id === vm.reservatorioSelecionado.id) {
            vm.map.markers_reserv = [{
              lat: parseFloat(vm.reservatoriosGeo[i].properties.latitude),
              lon: parseFloat(vm.reservatoriosGeo[i].properties.longitude)
            }];
            break;
          }
        }
        $location.search('id', vm.reservatorioSelecionado.id);
        $location.search('reservatorio', vm.reservatorioSelecionado.nome_sem_acento.replace(/ /g, "_").toLowerCase());
        updateShareData(vm.reservatorioSelecionado.reservat, vm.reservatorioSelecionado.id);

        efeitoZoom(vm.map.markers_reserv[0].lat, vm.map.markers_reserv[0].lon, 10);
        Reservatorio.monitoramento.query({id: vm.reservatorioSelecionado.id}, function(data) {
          vm.reservatorioSelecionado.volumes = data.volumes;
          vm.reservatorioSelecionado.volumes_recentes = data.volumes_recentes;
          vm.loadingInfo = false;
        });
        Reservatorio.previsoes.query({id: vm.reservatorioSelecionado.id}, function(data) {
          vm.reservatorioSelecionado.previsoes = data;
        });
      }
    }

    function setMunicipio(municipio) {
      vm.municipioSelecionado = municipio;
      vm.showSearchbar = false;
      vm.showLegend = false;

      efeitoZoom(parseFloat(vm.municipioSelecionado.latitude),parseFloat(vm.municipioSelecionado.longitude),10);
      vm.map.markers_municipio = [{
        lat: parseFloat(vm.municipioSelecionado.latitude),
        lon: parseFloat(vm.municipioSelecionado.longitude)
      }];
    }

    function setReservatorioMunicipio(id,tipo) {
      if(tipo === "reservatorio") {
        setReservatorio(id);
      } else if(tipo === "municipio"){
        for (var i = vm.municipios.length - 1; i >= 0; i--) {
          if (vm.municipios[i].id_municipio === id){
            setMunicipio(vm.municipios[i]);
            break;
          }
        }
      }
    }

    function isSelectedMapType(type) {
      return vm.selectedMapType === type;
    }

    function setSelectedMapType(type) {
      vm.selectedMapType = type;
      if (type == 1) {
        const uf = $location.search().uf;
        $location.search({});
        $location.search("uf", uf);
        setEstado(uf || "Semiarido");
        vm.map.markers_reserv.pop();
        vm.map.markers_municipio.pop();
        vm.reservatorioSelecionado = {};
        vm.map.layers[1].visible = false;
        vm.map.layers[2].visible = true;
        vm.map.layers[3].opacity = 0.4;
        if (larguraTela <= 640) {
          vm.showInfo = false;
        }
      }
      if (type == 0) {
        $location.search({});
        if (previousFeature){
          previousFeature.setStyle(null);
          previousFeature = null;
        }
        vm.map.layers[1].visible = true;
        vm.map.layers[2].visible = false;
        vm.map.layers[3].opacity = 1;

      }
      efeitoZoom(vm.latitude, vm.longitude, vm.zoomInicial);
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

    function toggleShare() {
      vm.showShare = !vm.showShare;
    }

    function copyUrl() {
      vm.copyTooltipText = "Copiado!";
    }

    function resetCopyUrl() {
      vm.copyTooltipText = "Copiar para área de transferência";
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
      if(feature.get("volume_percentual") === null) {
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
      $scope.$apply(function() {
          if(feature && isSelectedMapType(0) || isSelectedMapType(2)) {
            $location.search({});
            vm.setReservatorio(feature.get('id'));
          }
      });
    });


    $scope.$on('openlayers.map.pointermove', function (e, data) {
        $scope.$apply(function () {
            olData.getMap().then(function (map) {
                var pixel = map.getEventPixel(data.event.originalEvent);
                var hit = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                  if(layer.get('name')==="reservatorios" && (isSelectedMapType(0) || isSelectedMapType(2))){
                    map.getTarget().style.cursor = 'pointer';
                    return true;
                  } else if(layer.get('name')==="SemiaridoDark" && isSelectedMapType(1)){
                    map.getTarget().style.cursor = 'pointer';
                    return true;
                  }
                    return false;
                });

                if (typeof hit === 'undefined') {
                    map.getTarget().style.cursor = '';
                    return;
                }
            });
        });
    });

    function efeitoZoom(lat, lon, zoom) {
      larguraTela = $(window).width();
      var latMais = 0;
      var lonMais = 0;

      if(larguraTela < 1600 && larguraTela > 1000){
        lonMais = -0.4;
      }

      var reservatorio = ol.proj.fromLonLat([parseFloat(lon) + lonMais,parseFloat(lat) + latMais]);
      olData.getMap().then(function(map) {
        var zoomAnim = ol.animation.zoom({
            resolution: map.getView().getResolution(),
            duration: 2000
          });
        var pan = ol.animation.pan({
            duration: 2000,
            source: map.getView().getCenter()
          });
        map.beforeRender(pan, zoomAnim);
        map.getView().setCenter(reservatorio);
        map.getView().setZoom(zoom);

      });
    }

    Reservatorio.estadoEquivalente.query(function(response) {
      vm.loadingInfo = true;
      vm.estadoEquivalente = response;
      if($location.search().uf){
        setSelectedTab(5);
        setSelectedMapType(1);
        setEstado($location.search().uf);
      }
      vm.loadingInfo = false;
    }, function(error) {
      vm.loadingInfo = false;
      vm.gotError = true;
    });

    function setEstado(uf) {
      for (var i = 0; i < vm.estadoEquivalente.length; i++) {
        if (vm.estadoEquivalente[i].uf === uf){
          vm.loadingInfo = false;
          vm.showInfo = true;
          vm.showLegend = false;
          vm.estadoAtual = vm.estadoEquivalente[i];
          $location.search('uf', uf);
          updateShareData(vm.estadoEquivalente[i].semiarido, uf);
          break;
        }
        if(i === vm.estadoEquivalente.length-1) setEstado("Semiarido");
      }
    }

    function updateShareData(title, id){
      vm.share.title = title;
      vm.share.longText = "Veja a situação do "+title+" no Olho n'água: ";
      vm.share.shortText = title +" no Olho n'água";
      vm.share.url = $location.absUrl();
      // vm.share.url = "http://insa.gov.br/olhonagua/#/mapa";
      vm.share.media = RESTAPI.publicImagesPath+id+"-lg.png";
      vm.resetCopyUrl();
    }

    $scope.$on('openlayers.layers.SemiaridoDark.click', function(event, feature) {
      $scope.$apply(function() {
          if (feature && isSelectedMapType(1)) {
              setEstado(feature.getId());
              feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({ color:"rgba(16, 84, 125, 1)"})
              }));
              if (previousFeature && feature !== previousFeature) {
                previousFeature.setStyle(null);
              }
              previousFeature = feature;
          }
      });
    });


    $scope.$on('openlayers.map.click', function(event, feature) {
      $scope.$apply(function() {
          if (feature && isSelectedMapType(1)) {
              setEstado("Semiarido");
              if (previousFeature){
                previousFeature.setStyle(null);
                previousFeature = null;
              }
          }
      });
    });

  }
})();
