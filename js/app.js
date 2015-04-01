(function() {
  'use strict';

  // initial map and marker data
  var mapData = {
    // the dom element to draw the Google Map
    mapCanvasId: 'map-canvas',

    // initial map options passed to Google Maps
    options: {
      center: { lat: 18.3356297, lng: -64.7302395},
      zoom: 12
    },

    // data for locations
    places: [
      {
        title: "Home",
        position: {lat: 18.35269, lng: -64.7314672}
      },
      {
        title: "Maho Bay Beach",
        position: {lat: 18.3561342, lng: -64.7457178}
      },
      {
        title: "Low Key Watersports",
        position: {lat: 18.3302373, lng: -64.7963977}
      }
    ]
  };

  var ViewModel = function (mapData) {
    var self = this;


    this.initMarkers = function(locations) {
      var markers = [];
      locations.forEach(function(markerDatum) {
        var markerPosition = new google.maps.LatLng(markerDatum.position.lat, markerDatum.position.lng);
        var marker = new google.maps.Marker({
          position: markerPosition,
          title: markerDatum.title
        });
        marker.setMap(self.map());
        markers.push(marker)
      }, this);
      return markers;
    };

    this.mapDomId = ko.observable(mapData.mapCanvasId);
    this.mapOptions = ko.observable(mapData.options);
    this.map = ko.observable(undefined);
    this.markers = ko.observableArray(this.initMarkers(mapData.places));
    this.mapMode = ko.observable(true);
    this.listMode = ko.observable(false);
    this.searchQuery = ko.observable("");

    this.toggleView = function() {
      this.mapMode( !this.mapMode() );
      this.listMode( !this.listMode() );
    };

    this.isMarkerInSearchResults = function(marker) {
      var result = marker.title.toLowerCase().indexOf(self.searchQuery().toLowerCase()) != -1;
      console.log("isMarkerInSearchResults", marker, result);
      return result;
    };

    this.searchResults = ko.computed(function() {
      var searchResults = [];
      self.markers().forEach(function(marker) {
        if(self.isMarkerInSearchResults(marker)) {
          searchResults.push(marker);
          marker.setMap(self.map());
        } else {
          marker.setMap(undefined);
        }
      }, this);
      return searchResults;
    }, this);


    this.renderMap = function() {
      console.log('renderMap');
      self.map(new google.maps.Map(document.getElementById(self.mapDomId()), self.mapOptions()));
    };
  };

  // bind a new instance of our view model to the page
  var viewModel = new ViewModel(mapData);
  ko.applyBindings(viewModel);
  viewModel.renderMap();
}());
