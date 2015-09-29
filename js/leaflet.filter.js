L.Control.GeoKretyFilter = L.Control.extend({
  options: {
    position: 'topright'
  },

  initialize: function (options) {
    L.setOptions(this, options);

  },

  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-control-geokrety');
    this.form = L.DomUtil.create('form', 'form', container);
    var group = L.DomUtil.create('div', 'leaflet-geokrety-form-group', this.form);

    this.gkrecentinput = L.DomUtil.create('input', 'leaflet-geokrety-form-control', group);
    this.gkrecentinput.type = 'checkbox';
    this.gkrecentinput.name = 'geokrety_move_recent';
    this.gkrecentinput.value= 'newer';
    this.gkrecentinput.checked = true;
    this.gkrecentlabel = L.DomUtil.create('label', '', group);
    this.gkrecentlabel.setAttribute('for', 'geokrety_move_recent');
    this.gkrecentlabel.innerHTML = 'Has moved since 3 months';

    this.gkoldinput = L.DomUtil.create('input', 'leaflet-geokrety-form-control', group);
    this.gkoldinput.type = 'checkbox';
    this.gkoldinput.name = 'geokrety_move_old';
    this.gkoldinput.value= 'older';
    this.gkoldlabel = L.DomUtil.create('label', '', group);
    this.gkoldlabel.setAttribute('for', 'geokrety_move_old');
    this.gkoldlabel.innerHTML = 'Has not moved since 3 months';

    this.gkghostsinput = L.DomUtil.create('input', 'leaflet-geokrety-form-control', group);
    this.gkghostsinput.type = 'checkbox';
    this.gkghostsinput.name = 'geokrety_move_ghosts';
    this.gkghostsinput.value= 'ghosts';
    this.gkghostsinput.checked = true;
    this.gkghostslabel = L.DomUtil.create('label', '', group);
    this.gkghostslabel.setAttribute('for', 'geokrety_move_ghosts');
    this.gkghostslabel.innerHTML = 'In cache';

    //this.results = L.DomUtil.create('div', 'list-group', group);

    //L.DomEvent.addListener(this.input, 'keyup', _.debounce(this.keyup, 300), this);
    //L.DomEvent.addListener(this.form, 'submit', this.submit, this);
    //L.DomEvent.disableClickPropagation(container);
    return container;


  },

  onRemove: function (map) {
    // when removed
    window.console.log("test4");
    return;
  }

});

L.control.geokretyfilter = function(id, options) {
  return new L.Control.GeoKretyFilter(id, options);
}


//L.Control.Search = L.Control.extend({
//  options: {
//    // topright, topleft, bottomleft, bottomright
//    position: 'topright',
//    placeholder: 'Search...'
//  },
//  initialize: function (options /*{ data: {...}  }*/) {
//    // constructor
//    L.Util.setOptions(this, options);
//  },
//  onAdd: function (map) {
//    // happens after added to map
//    var container = L.DomUtil.create('div', 'search-container');
//    this.form = L.DomUtil.create('form', 'form', container);
//    var group = L.DomUtil.create('div', 'form-group', this.form);
//    this.input = L.DomUtil.create('input', 'form-control input-sm', group);
//    this.input.type = 'text';
//    this.input.placeholder = this.options.placeholder;
//    this.results = L.DomUtil.create('div', 'list-group', group);
//    L.DomEvent.addListener(this.input, 'keyup', _.debounce(this.keyup, 300), this);
//    L.DomEvent.addListener(this.form, 'submit', this.submit, this);
//    L.DomEvent.disableClickPropagation(container);
//    return container;
//  },
//  onRemove: function (map) {
//    // when removed
//    L.DomEvent.removeListener(this._input, 'keyup', this.keyup, this);
//    L.DomEvent.removeListener(form, 'submit', this.submit, this);
//  },
//  keyup: function(e) {
//    if (e.keyCode === 38 || e.keyCode === 40) {
//      // do nothing
//    } else {
//      this.results.innerHTML = '';
//      if (this.input.value.length > 2) {
//        var value = this.input.value;
//        var results = _.take(_.filter(this.options.data, function(x) {
//          return x.feature.properties.park.toUpperCase().indexOf(value.toUpperCase()) > -1;
//        }).sort(sortParks), 10);
//        _.map(results, function(x) {
//          var a = L.DomUtil.create('a', 'list-group-item');
//          a.href = '';
//          a.setAttribute('data-result-name', x.feature.properties.park);
//          a.innerHTML = x.feature.properties.park;
//          this.results.appendChild(a);
//          L.DomEvent.addListener(a, 'click', this.itemSelected, this);
//          return a;
//        }, this);
//      }
//    }
//  },
//  itemSelected: function(e) {
//    L.DomEvent.preventDefault(e);
//    var elem = e.target;
//    var value = elem.innerHTML;
//    this.input.value = elem.getAttribute('data-result-name');
//    var feature = _.find(this.options.data, function(x) {
//      return x.feature.properties.park === this.input.value;
//    }, this);
//    if (feature) {
//      this._map.fitBounds(feature.getBounds());
//    }
//    this.results.innerHTML = '';
//  },
//  submit: function(e) {
//    L.DomEvent.preventDefault(e);
//  }
//});
//
//L.control.search = function(id, options) {
//  return new L.Control.Search(id, options);
//}
