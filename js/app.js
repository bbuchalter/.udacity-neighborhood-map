(function() {
  'use strict';

  // initial map and marker data
  var mapData = {
    // the dom element to draw the Google Map
    mapCanvasId: 'map-canvas',

    // initial map options passed to Google Maps
    options: {
      center: { lat: 18.3356297, lng: -64.7302395},
      zoom: 13
    },

    // data for markers
    places: [
      {
        title: "Home",
        position: {lat: 18.35269, lng: -64.7314672}
      },
      {
        title: "Maho Bay Beach",
        position: {lat: 18.3561342, lng: -64.7457178}
      }
    ]
  };

  var ViewModel = function (mapData) {
    var self = this;

    this.mapDomId = ko.observable(mapData.mapCanvasId);
    this.mapOptions = ko.observable(mapData.options);
    this.markerData = ko.observableArray(mapData.places);

    this.renderMarkers = function() {
      this.markerData().forEach(function(markerDatum) {
        var markerPosition = new google.maps.LatLng(markerDatum.position.lat, markerDatum.position.lng);
        var marker = new google.maps.Marker({
          position: markerPosition,
          title: markerDatum.title
        });
        marker.setMap(self.map());
      }, self);
    };


    this.renderMap = function() {
      self.map = ko.observable(new google.maps.Map(document.getElementById(self.mapDomId()),
        self.mapOptions()));

      self.renderMarkers();
    };
  };

  // bind a new instance of our view model to the page
  var viewModel = new ViewModel(mapData);
  ko.applyBindings(viewModel);
  viewModel.renderMap();
}());
