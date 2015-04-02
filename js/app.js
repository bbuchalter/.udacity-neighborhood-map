(function() {
  'use strict';

  var MapViewModel = function (domId, mapOptions) {
    this.googleMap = new google.maps.Map(document.getElementById(domId), mapOptions);
  };

  var InfoWindowViewModel = function(title) {
    var self = this;

    // Create Google InfoWindow object to define content for marker when clicked.
    this.googleInfoWindow = new google.maps.InfoWindow();
    this.title = title;

    this.close = function() {
      self.googleInfoWindow.close();
    };

    this.open = function(googleMap, googleMarker) {
      self.googleInfoWindow.open(googleMap, googleMarker);
    };

    // Takes image search results data, builds DOM nodes, attaches to infoWindow
    this.setContentFromSearchResults = function(searchResultsData) {
      var contentNode = self.buildContentNodeFromSearchResults(searchResultsData);
      self.googleInfoWindow.setContent(contentNode);
    };

    // Takes image search results data, builds DOM nodes.
    this.buildContentNodeFromSearchResults = function(searchResultsData) {
      var containerNode = document.createElement("div");

      var titleNode = document.createElement("h1");
      titleNode.textContent = this.title;
      containerNode.appendChild(titleNode);

      var imgSearchResults = JSON.parse(searchResultsData);
      imgSearchResults.items.forEach(function(searchResult) {
        var imageNode = document.createElement("img");
        imageNode.src = searchResult.link;
        containerNode.appendChild(imageNode);
      });

      return containerNode;
    };

    this.populateContent = function() {
      var queryUrl = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyC4dPe_yN-2mi8CPVDkkK3Nyfa_VZUvFZo&cx=009193896825055063209:rbnrlbobrz4&q=' + self.title + ' St. John USVI&searchType=image&fileType=jpg&imgSize=small&alt=json&fields=items/link';
      var searchResultsCache = localStorage.getItem(queryUrl);

      if(searchResultsCache) {
        self.setContentFromSearchResults(searchResultsCache);
      }
      else {
        promise.get(queryUrl).then(function(error, data, xhr) {
          if (error) {
            self.googleInfoWindow.setContent("There was a problem searching for content for '" + self.title + "'. Please try again.");
          }
          else {
            localStorage.setItem(queryUrl, data); // Cache search result
            self.setContentFromSearchResults(data);
          }
        });
      }
    };
  };

  var MarkerViewModel = function(title, lat, lng) {
    var self = this;

    // Create Google LatLng object to position marker.
    this.title = title;
    this.markerPosition = new google.maps.LatLng(lat, lng);
    this.selected = ko.observable(false);

    //Create Google Marker object to place on map
    this.googleMarker = new google.maps.Marker({
      position: self.markerPosition,
      title: self.title
    });

    this.setVisible = function(visibility) {
      self.googleMarker.setVisible(visibility);
    };

    this.setSelected = function(selected) {
      self.selected(selected);
    };

    this.selectedState = ko.computed(function() {
      if(self.selected()) {
       self.googleMarker.setOpacity(1);
      }
      else {
        self.googleMarker.setOpacity(0.5);
      }
    });
  };


  // The LocationViewModel serves to coordinate behavior on the map.
  // It knows some of the internals of the Marker, InfoWindow, and Map
  // in order to have Google trigger events and place items on the map.
  var LocationViewModel = function(marker, infoWindow, map) {
    var self = this;

    this.active = ko.observable(false);
    this.visible = ko.observable(true);
    this.marker = ko.observable(marker);
    this.infoWindow = ko.observable(infoWindow);
    this.map = ko.observable(map);

    this.title = ko.computed(function() {
      return self.marker().title;
    });

    this.googleMarker = function() {
      return self.marker().googleMarker;
    };

    this.googleInfoWindow = function() {
      return self.infoWindow().googleInfoWindow;
    };

    this.googleMap = function() {
      return self.map().googleMap;
    }

    this.setActive = function(active) {
      self.active(active);
    };

    this.setVisible = function(visible) {
      self.visible(visible);
    };

    this.visibleState = ko.computed(function() {
      if(self.visible()) {
        self.marker().setVisible(true);
      }
      else {
        self.marker().setVisible(false);
        self.setActive(false); // invisible markers can't be active
      }
    });

    this.selectionState = ko.computed(function() {
      if(self.active()) {
        self.marker().setSelected(true);
        self.infoWindow().open(self.googleMap(), self.googleMarker());
      } else {
        self.marker().setSelected(false);
        self.infoWindow().close();
      }
    });

    this.placeMarkerOnMap = function() {
      self.googleMarker().setMap(self.googleMap());
    };
  };


  var SearchViewModel = function(locations) {
    var self = this;

    this.locations = locations;
    this.searchQuery = ko.observable("");
    this.listVisible = ko.observable(false);
    this.currentLocation = ko.observable(null);

    this.isLocationInSearchResults = function(location) {
      // Simple case-insensitive title string search
      return location.title().toLowerCase().indexOf(self.searchQuery().toLowerCase()) != -1;
    };

    this.markerSearchResults = ko.computed(function() {
      // Initialize a new set of results
      var markerSearchResults = [];

      // For each marker
      self.locations.forEach(function(location) {

        // If the location should be part of search results
        // Include it and make it visible on the map
        if(self.isLocationInSearchResults(location)) {
          markerSearchResults.push(location);
          location.setVisible(true);
        }

        // Otherwise, exclude it and hide on the map along with it's infowindow
        else {
          location.setVisible(false);
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

    this.setCurrentLocation = function(location) {
      self.currentLocation(location);
    };

    this.locationState = ko.computed(function() {
      self.locations.forEach(function(location) {
        if(location == self.currentLocation()) {
          location.setActive(true);
        }
        else {
          location.setActive(false);
        }
      });
    });


    // For each marker
    this.locations.forEach(function(location) {

      // Add click event listener on marker
      google.maps.event.addListener(location.googleMarker(), 'click', function() {

        // To set the current location
        self.setCurrentLocation(location);
      });

      // Add click event listener on infowindow close
      google.maps.event.addListener(location.googleInfoWindow(), 'closeclick', function() {

        // To set the current marker to null
        self.setCurrentLocation(null);
      });
    });
  };

  // bind a new instance of our view model to the page
  var map = new MapViewModel('map-canvas', {
    center: {lat: 18.3356297, lng: -64.7302395},
    zoom: 12
  });

  var markerData = [
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

  var locations = [];
  markerData.forEach(function(markerDatum) {
    var infoWindow = new InfoWindowViewModel(markerDatum.title);
    infoWindow.populateContent();

    var marker = new MarkerViewModel(markerDatum.title, markerDatum.position.lat, markerDatum.position.lng);
    var location = new LocationViewModel(marker, infoWindow, map);
    location.placeMarkerOnMap();

    locations.push(location);
  });

  var searchViewModel = new SearchViewModel(locations);
  ko.applyBindings(searchViewModel);
}());
