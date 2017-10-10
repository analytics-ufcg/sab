(function() {
  'use strict';

  angular.module('sabApp.serviceWorker', [])
    .service('ServiceWorker', serviceWorker);

  serviceWorker.$inject = ['toastr'];

  /*jshint latedef: nofunc */
  function serviceWorker(toastr) {
    this.checkServiceWorker = function() {
      if ('serviceWorker' in navigator) {
        return true;
      }
      return false;
    };

    this.registerWorker = function(worker) {
      if (this.checkServiceWorker()) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register(worker).then(function (registration) {

            registration.onupdatefound = function() {
              var installingWorker = registration.installing;

              installingWorker.onstatechange = function() {
                switch (installingWorker.state) {
                  case 'installed':
                    if (navigator.serviceWorker.controller) {
                      // Cria aviso na interface para atualizar o app
                      toastr.info("<p>Nova versão do Olho N'Água está disponível. <a class='btn btn-sm btn-default' onclick='javascript:window.location.reload()'>&nbsp;Atualizar&nbsp;</a></p>", '',
                        {
                          allowHtml: true,
                          timeOut: 5000
                        });
                      console.log('New or updated content is available.');
                    } else {
                      console.log('Content is now available offline!');
                    }
                    break;
                  case 'redundant':
                    console.error('The installing service worker became redundant.');
                    break;
                }
              };
            };

          }).catch(function (err) {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      } else {
        console.log("Este navegador não suporta service workers");
      }
    };
  }
})();
