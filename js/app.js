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
    this.map = ko.observable(new google.maps.Map(document.getElementById(self.mapDomId()), self.mapOptions()));
    this.markers = ko.observableArray(this.initMarkers(mapData.places));
    this.searchQuery = ko.observable("");
    this.searchQueryHasFocus = ko.observable(false);
    this.setSearchQueryHasFocus = function() {
      self.searchQueryHasFocus(!self.searchQueryHasFocus());
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
          marker.setVisible(true);
        } else {
          marker.setVisible(false);
        }
      }, this);
      return searchResults;
    }, this);

  };

  // bind a new instance of our view model to the page
  var viewModel = new ViewModel(mapData);
  ko.applyBindings(viewModel);
}());
