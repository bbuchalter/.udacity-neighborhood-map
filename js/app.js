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
        // Create Google LatLng object to position marker.
        var markerPosition = new google.maps.LatLng(markerDatum.position.lat, markerDatum.position.lng);

        // Create Google InfoWindow object to define content for marker when clicked.
        var infoWindow = new google.maps.InfoWindow({
          content: markerDatum.title
        });

        var setInfoWindowContent = function(infoWindow, searchResults) {
          var infoWindowContentNode = document.createElement("div");

          var titleNode = document.createElement("h1");
          titleNode.textContent = markerDatum.title;
          infoWindowContentNode.appendChild(titleNode);

          var imgSearchResults = JSON.parse(searchResults);
          imgSearchResults.items.forEach(function(searchResult) {
            var imageNode = document.createElement("img");
            imageNode.src = searchResult.link;
            infoWindowContentNode.appendChild(imageNode);
          }, this);

          infoWindow.setContent(infoWindowContentNode);
        };


        var queryUrl = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyC4dPe_yN-2mi8CPVDkkK3Nyfa_VZUvFZo&cx=009193896825055063209:rbnrlbobrz4&q=' + markerDatum.title + ' St. John USVI&searchType=image&fileType=jpg&imgSize=small&alt=json&fields=items/link';
        var searchCache = localStorage.getItem(queryUrl);
        if(searchCache) {
          setInfoWindowContent(infoWindow, searchCache);
        }
        else {
          promise.get(queryUrl).then(function(error, text, xhr) {
            if (error) {
              infoWindow.setContent("There was a problem searching for content for '" + markerDatum.title+ "'. Please try again.");
            }
            else {
              localStorage.setItem(queryUrl, text); // Cache search result
              setInfoWindowContent(infoWindow, text);
            }
          });
        }


        //Create Google Marker object to place on map
        var marker = new google.maps.Marker({
          position: markerPosition,
          title: markerDatum.title
        });

        // Attach the infoWindow directly to the marker
        marker.infoWindow = infoWindow;

        // Place the marker on the map
        marker.setMap(self.map());

        // Add event listener to show InfoWindow when Marker clicked
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(self.map(), marker);
        });

        // Include in list of markers
        markers.push(marker)
      }, this);

      return markers;
    };

    this.mapDomId = ko.observable(mapData.mapCanvasId);
    this.mapOptions = ko.observable(mapData.options);
    this.map = ko.observable(new google.maps.Map(document.getElementById(self.mapDomId()), self.mapOptions()));
    this.markers = ko.observableArray(this.initMarkers(mapData.places));
    this.searchQuery = ko.observable("");
    this.listVisible = ko.observable(false);

    this.isMarkerInSearchResults = function(marker) {
      var result = marker.title.toLowerCase().indexOf(self.searchQuery().toLowerCase()) != -1;
      return result;
    };

    this.openMarkerInfo = function(marker) {
      self.markers().forEach(function(marker) {
        marker.infoWindow.close();
        marker.setOpacity(0.5);
      });

      marker.infoWindow.open(self.map(), marker);
      marker.setOpacity(1);
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

    this.hideList = function() {
      self.listVisible(false);
    };

    this.showList = function() {
      self.listVisible(true);
    };

    // Add event listener to close search results when Map clicked
    google.maps.event.addListener(self.map(), 'click', function() {
      self.hideList();
    });
  };

  // bind a new instance of our view model to the page
  var mapViewModel = new ViewModel(mapData);
  ko.applyBindings(mapViewModel);
}());
