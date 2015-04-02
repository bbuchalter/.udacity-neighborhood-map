(function() {
  'use strict';

  // initial map and marker data
  var mapData = {
    // the dom element to draw the Google Map
    mapCanvasId: 'map-canvas',

    // initial map options passed to Google Maps
    options: {
      center: {lat: 18.3356297, lng: -64.7302395},
      zoom: 12
    }
  };

  var locationData = [
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
  ];

  var MapViewModel = function (mapData) {
    var self = this;


    this.initMarkers = function(locations) {
      var markers = [];
      //
      //locations.forEach(function(markerDatum) {
      //
      //  // Add event listener to show InfoWindow when Marker clicked
      //  google.maps.event.addListener(self.googleMarker, 'click', function() {
      //    self.infoWindow.open(self.map, self.googleMarker);
      //  });
      //
      //  // Include in list of markers
      //  markers.push(marker)
      //}, this);

      return markers;
    };

    this.mapDomId = ko.observable(mapData.mapCanvasId);
    this.mapOptions = ko.observable(mapData.options);
    this.googleMap = new google.maps.Map(document.getElementById(self.mapDomId()), self.mapOptions());

    //this.openMarkerInfo = function(marker) {
    //  self.markers().forEach(function(marker) {
    //    marker.infoWindow.close();
    //    marker.setOpacity(0.5);
    //  });
    //
    //  marker.infoWindow.open(self.map, marker);
    //  marker.setOpacity(1);
    //};


    // Add event listener to close search results when Map clicked
    //google.maps.event.addListener(self.googleMap, 'click', function() {
    //  self.hideList();
    //});
  };

  var MarkerViewModel = function(locationData, map, infoWindow) {
    var self = this;

    // Create Google LatLng object to position marker.
    this.title = locationData.title;
    this.markerPosition = new google.maps.LatLng(locationData.position.lat, locationData.position.lng);
    this.map = map;
    this.infoWindow = infoWindow;

    //Create Google Marker object to place on map
    this.googleMarker = new google.maps.Marker({
      position: self.markerPosition,
      title: self.title
    });

    this.setVisible = function(visibility) {
      self.googleMarker.setVisible(visibility);
    };

    this.showInfo = function() {
      console.log("show info", self);
    };

    // Place the marker on the map
    self.googleMarker.setMap(self.map.googleMap);
  };

  var InfoWindowViewModel = function(marker) {
    var self = this;

    // Create Google InfoWindow object to define content for marker when clicked.
    this.googleInfoWindow = new google.maps.InfoWindow();
    this.marker = marker;

    this.setInfoWindowContent = function(searchResults) {
      var containerNode = document.createElement("div");

      var titleNode = document.createElement("h1");
      titleNode.textContent = this.marker.title;
      containerNode.appendChild(titleNode);

      var imgSearchResults = JSON.parse(searchResults);
      imgSearchResults.items.forEach(function(searchResult) {
        var imageNode = document.createElement("img");
        imageNode.src = searchResult.link;
        containerNode.appendChild(imageNode);
      }, this);

      self.googleInfoWindow.setContent(containerNode);
    };

    this.populateInfoWindow = function() {
      var queryUrl = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyC4dPe_yN-2mi8CPVDkkK3Nyfa_VZUvFZo&cx=009193896825055063209:rbnrlbobrz4&q=' + self.marker.title + ' St. John USVI&searchType=image&fileType=jpg&imgSize=small&alt=json&fields=items/link';
      var searchCache = localStorage.getItem(queryUrl);
      if(searchCache) {
        self.setInfoWindowContent(searchCache);
      }
      else {
        promise.get(queryUrl).then(function(error, text, xhr) {
          if (error) {
            infoWindow.setContent("There was a problem searching for content for '" + markerDatum.title+ "'. Please try again.");
          }
          else {
            localStorage.setItem(queryUrl, text); // Cache search result
            self.setInfoWindowContent(text);
          }
        });
      }
    };

    self.populateInfoWindow();
  };

  var SearchViewModel = function(markers) {
    var self = this;
    this.markers = markers;
    this.searchQuery = ko.observable("");
    this.listVisible = ko.observable(false);

    this.isMarkerInSearchResults = function(marker) {
      // Simple case-insensitive title string search
      return marker.title.toLowerCase().indexOf(self.searchQuery().toLowerCase()) != -1;
    };

    this.markerSearchResults = ko.computed(function() {
      // Initialize a new set of results
      var markerSearchResults = [];

      // For each marker
      self.markers.forEach(function(marker) {

        // If the marker should be part of search results
        // Include it and make it visible on the map
        if(self.isMarkerInSearchResults(marker)) {
          markerSearchResults.push(marker);
          marker.setVisible(true);
        }

        // Otherwise, exclude it and hide on the map
        else {
          marker.setVisible(false);
        }
      });

      return markerSearchResults;
    });

    this.hideList = function() {
      self.listVisible(false);
    };

    this.showList = function() {
      self.listVisible(true);
    };

    this.hideAllMarkerInfo = function() {
      console.log('close all marker info');
    }

    this.showMarkerInfo = function(marker) {
      self.hideAllMarkerInfo();
      console.log('show marker info for', marker);
    }
  };

  // bind a new instance of our view model to the page
  var mapViewModel = new MapViewModel(mapData);
  var markers = [];

  locationData.forEach(function(locationDatum) {
    var markerViewModel = new MarkerViewModel(locationDatum, this);
    var infoWindowViewModel = new InfoWindowViewModel(markerViewModel);
    markers.push(markerViewModel);
  }, mapViewModel);

  var searchViewModel = new SearchViewModel(markers);
  ko.applyBindings(searchViewModel);
}());
