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

    this.mapDomId = ko.observable(mapData.mapCanvasId);
    this.mapOptions = ko.observable(mapData.options);
    this.locations = ko.observableArray(mapData.places);
    this.markers = ko.observableArray([]);
    this.mapMode = ko.observable(true);
    this.listMode = ko.observable(false);
    this.searchQuery = ko.observable("");

    this.toggleView = function() {
      this.mapMode( !this.mapMode() );
      this.listMode( !this.listMode() );
    };

    this.hideAllMarkers = function() {
      self.markers().forEach(function(marker) {
        marker.setMap(undefined);
      });
    };

    this.showAllMarkers = function() {
      self.markers().forEach(function(marker) {
        marker.setMap(self.map());
      });
    };

    this.searchResults = ko.computed(function() {
      var searchResults = [];

      console.log('running searchResults')
      if(self.searchQuery() == "") {
        // No search query, all markers are search results
        searchResults = self.markers();
      } else {
        // Include only markers whose title contains searchQuery
        self.markers().forEach(function(marker) {
          if(marker.title.toLowerCase().indexOf(self.searchQuery().toLowerCase()) != -1) {
            searchResults.push(marker);
          }
        });
      }

      return searchResults;
    }, this);

    this.renderMarkers = function() {
      this.locations().forEach(function(markerDatum) {
        var markerPosition = new google.maps.LatLng(markerDatum.position.lat, markerDatum.position.lng);
        var marker = new google.maps.Marker({
          position: markerPosition,
          title: markerDatum.title
        });
        self.markers.push(marker)
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
