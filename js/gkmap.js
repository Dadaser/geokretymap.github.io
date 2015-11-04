var map;
var geoJsonLayer;
var markers = L.markerClusterGroup({maxClusterRadius: 40, disableClusteringAtZoom: 8});
var geokretyfilter = new L.control.geokretyfilter({"data": undefined}, undefined);

var blue = 0;
var red = 1;
var grey = 2;
var markersCounter = [0, 0, 0];

function initmap() {
  // set up the map
  map = new L.Map('map');

  // create the tile layer with correct attribution
  var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});   

  // for all possible values and explanations see "Template Parameters" in https://msdn.microsoft.com/en-us/library/ff701716.aspx
  var imagerySet = "Aerial"; // AerialWithLabels | Birdseye | BirdseyeWithLabels | Road
  var bing = new L.BingLayer("LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc", {type: imagerySet});

  map.addLayer(osm);
  map.addControl(new L.Control.Layers({'OSM':osm, "Bing":bing}));

  // Filter plugin
  map.addControl(geokretyfilter);

  // Fullscreen plugin
  map.addControl(L.control.fullscreen());

  // start the map at Paris
  map.setView(new L.LatLng(43.5943, 6.9509), 8);
  map.locate({setView: true, maxZoom: 16});
}


var blueIcon = new L.Icon({
  iconSize: [25, 40],
  iconAnchor: [12, 40],
  popupAnchor:  [1, -24],
  iconUrl: '/js/images/marker-icon.png',
  shadowUrl: '/js/images/marker-shadow.png'
});

var redIcon = new L.Icon({
  iconSize: [25, 40],
  iconAnchor: [12, 40],
  popupAnchor:  [1, -24],
  iconUrl: '/js/images/marker-icon-red.png',
  shadowUrl: '/js/images/marker-shadow.png'
});

var greyIcon = new L.Icon({
  iconSize: [25, 40],
  iconAnchor: [12, 40],
  popupAnchor:  [1, -24],
  iconUrl: '/js/images/marker-icon-grey.png',
  shadowUrl: '/js/images/marker-shadow.png'
});

function pointToLayer(feature, latlng) {
  if (feature.properties && feature.properties.age) {
    if (feature.properties.age == 99999) {
      markersCounter[grey] += 1;
      return L.marker(latlng, { icon: greyIcon });
    } else if (feature.properties.age > 90) {
      markersCounter[red] += 1;
      return L.marker(latlng, { icon: redIcon });
    } else {
      markersCounter[blue] += 1;
      return L.marker(latlng, { icon: blueIcon });
    }
  }
  markersCounter[grey] += 1;
  return L.marker(latlng, { icon: greyIcon });
}

function updateCounters() {
  $("#map-legend-blue").html(markersCounter[blue]);
  $("#map-legend-red").html(markersCounter[red]);
  $("#map-legend-grey").html(markersCounter[grey]);
  markersCounter = [0, 0, 0];
}

function onEachFeature(feature, layer) {
  // does this feature have a property named popupContent?
  if (feature.properties && feature.properties.popupContent) {
    layer.bindPopup(feature.properties.popupContent);
  }
}

function retrieve() {
  var bounds = map.getBounds();
  var filter="";
  if (geokretyfilter.gkrecentinput.checked) {
    filter += "&"+geokretyfilter.gkrecentinput.value
  }
  if (geokretyfilter.gkoldinput.checked) {
    filter += "&"+geokretyfilter.gkoldinput.value
  }
  if (!geokretyfilter.gkghostsinput.checked) {
    filter += "&"+geokretyfilter.gkghostsinput.value
  }

  var url="//api.geokretymap.org/export2.php?latTL="+bounds.getNorth()+"&lonTL="+bounds.getEast()+"&latBR="+bounds.getSouth()+"&lonBR="+bounds.getWest()+"&limit=500&json=1"+filter;

  jQuery.ajax({
    dataType: "json",
    url: url,
    success: function(data){
      if (geoJsonLayer != undefined) {
        markers.removeLayer(geoJsonLayer);
      }
      geoJsonLayer = L.geoJson(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature,
      });
      updateCounters();
      markers.addLayer(geoJsonLayer);
      map.addLayer(markers);
    },
    error: function(xhr){
      var err = eval("(" + xhr.responseText + ")");
      window.console.log(err.Message);
    }
  });
}


initmap();
retrieve();

map.on('moveend', function() {
  retrieve();
});
