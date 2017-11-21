angular.module('app.services', [])

.factory('elasticClient', ['esFactory', function(esFactory) {

            // currently I completely do not understand why I haven't to call "esFactory.factory", as this is the defined
            // method on "esFactory" in elasticsearch.angular.js which returns an instance of "Client", but maybe somebody will
            // explain that fact.

            // this will actually create a "Client"-Instance which you can configure as you wish.
            return esFactory({
                host: 'http://bluemix:0dededb45fa58478530267f182948063@nori-us-east-1.searchly.com',
            });
        }])


// Storage Service
.factory ('StorageService', function ($localStorage) {
  $localStorage = $localStorage.$default({
    things: []
  });


var _getAll = function () {
  return $localStorage.things;
};
var _add = function (thing) {
  $localStorage.things.push(thing);
}
var _remove = function (thing) {
  $localStorage.things.splice($localStorage.things.indexOf(thing), 1);
}
return {
    getAll: _getAll,
    add: _add,
    remove: _remove
  };
});
