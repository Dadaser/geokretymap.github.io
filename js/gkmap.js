var map;
var geoJsonLayer;
var markers = L.markerClusterGroup({
  maxClusterRadius: 40,
  spiderfyOnMaxZoom: true
});
var geokretyfilter = new L.control.geokretyfilter({"data": undefined}, undefined);

var blue = 0;
var red = 1;
var grey = 2;
var markersCounter = [0, 0, 0];
var markersCounterTotal = 0;

var initial_position = new L.LatLng(43.5943, 6.9509);
var initial_zoom = 8;

var maxRange = 90;
var savedMaxRange = 45;

var slider = undefined;

function initmap() {
  // set up the map
  map = new L.Map('map');

  // Hash link
  //var hash = new L.Hash(map, {zoom: 8, center: [43.5943, 6.9509]});

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
  slider = document.getElementById('geokrety_age_slider');

  // Fullscreen plugin
  map.addControl(L.control.fullscreen());

  // Ask to locate by browser
  map.locate({setView: true, maxZoom: 16});


  noUiSlider.create(slider, {
    start: [0, savedMaxRange],
    connect: true,
    //tooltips: true,
    step: 1,
    range: {
      'min': 0,
      'max': maxRange
    },
    format: {
      to: function ( value ) {
        return value;
      },
      from: function ( value ) {
        return value;
      }
    }
  });

  slider.noUiSlider.on('slide', function(){
    updateSlider(slider);
  });

  slider.noUiSlider.on('change', function(){
    updateSlider(slider);
    retrieve();
  });

  // Read urls parameters
  readUrl();

  $('#days-min').html(slider.noUiSlider.get()[0]);
  $('#days-max').html(slider.noUiSlider.get()[1]);

  //var origins = slider.getElementsByClassName('noUi-origin');
  $('#geokrety_move_old').change(function() {
    if ($(this).prop('checked') == true) {
      savedMaxRange = slider.noUiSlider.get()[1];
  console.log(slider);
      slider.noUiSlider.set([null, maxRange]);
      //origins[1].setAttribute('disabled', true);
    } else {
      //origins[1].removeAttribute('disabled');
      slider.noUiSlider.set([null, savedMaxRange]);
    }
    updateSlider(slider);
  });

  $("#map").height($(window).height()*0.85);
  map.invalidateSize();
}

function updateSlider(slider) {
  $('#days-min').html(slider.noUiSlider.get()[0]);
  $('#days-max').html(slider.noUiSlider.get()[1]);
  if (slider.noUiSlider.get()[1] != maxRange) {
    $('#geokrety_move_old').prop('checked', false);
  }
  $("#map").focus();
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
  markersCounterTotal += 1;
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
  $("#map-legend-total").html(markersCounterTotal);
  markersCounter = [0, 0, 0];
  markersCounterTotal = 0;
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

  //if ($("#geokrety_move_recent").prop('checked') == true) {
  //  filter += "&newer"
  //}
  if ($("#geokrety_move_old").prop('checked') == true) {
    filter += "&older"
  }
  if ($("#geokrety_no_move_date").prop('checked') == true) {
    filter += "&nodate=1"
  }
  if ($("#geokrety_move_ghosts").prop('checked') == false) {
    filter += "&ghosts"
  }
  if ($("#geokrety_missing").prop('checked') == true) {
    filter += "&missing"
  }

  filter += "&daysFrom=" + $('#days-min').html();
  filter += "&daysTo="   + $('#days-max').html();

  var url="https://api.geokretymap.org/export2.php?latTL="+bounds.getNorth()+"&lonTL="+bounds.getEast()+"&latBR="+bounds.getSouth()+"&lonBR="+bounds.getWest()+"&limit=500&json=1"+filter;

  writeUrl();

  map.spin(true, { scale: 2 });
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
      map.spin(false);
    },
    error: function(xhr){
      map.spin(false);
      var err = eval("(" + xhr.responseText + ")");
      window.console.log(err.Message);
    }
  });
}


initmap();
retrieve();

map.on('viewreset', function() {
  retrieve();
});

map.on('dragend', function() {
  retrieve();
});


function writeUrl() {
  params = "#";
  params += map.getZoom();
  params += "/";
  params += map.getCenter().lat;
  params += "/";
  params += map.getCenter().lng;
  params += "/";

  if ($("#geokrety_move_old").prop('checked') == true) {
    params += "1/"
  } else {
    params += "0/"
  }
  if ($("#geokrety_no_move_date").prop('checked') == true) {
    params += "1/"
  } else {
    params += "0/"
  }
  if ($("#geokrety_move_ghosts").prop('checked') == true) {
    params += "1/"
  } else {
    params += "0/"
  }
  if ($("#geokrety_missing").prop('checked') == true) {
    params += "1/"
  } else {
    params += "0/"
  }

  params += $('#days-min').html() + "/";
  params += $('#days-max').html();


  location.replace(params);
}

function readUrl() {
  var hash = location.hash;
  if (hash.indexOf('#') === 0) {
    hash = hash.substr(1);
  }
  var args = hash.split("/");
  if (args.length == 9) {
    var zoom     = parseInt(args[0], 10),
        lat      = parseFloat(args[1]),
        lon      = parseFloat(args[2]),
        move_old = parseFloat(args[3]),
        move_no  = parseFloat(args[4]),
        ghost    = parseFloat(args[5]),
        missing  = parseFloat(args[6]);
    if (isNaN(zoom) || isNaN(lat) || isNaN(lon) || isNaN(move_old) || isNaN(move_no) || isNaN(ghost) || isNaN(missing)) {
      //return false;
      map.setView(initial_position, initial_zoom);
    } else {
      map.setView(new L.LatLng(lat, lon), zoom);
      $("#geokrety_move_old").prop('checked', move_old);
      $("#geokrety_no_move_date").prop('checked', move_no);
      $("#geokrety_move_ghosts").prop('checked', ghost);
      $("#geokrety_missing").prop('checked', missing);
      if (move_old) { slider.noUiSlider.set([null, maxRange]); }
    }
  } else {
    map.setView(initial_position, initial_zoom);
  }
}


