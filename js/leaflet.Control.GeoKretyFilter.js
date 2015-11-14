L.Control.GeoKretyFilter = L.Control.extend({
  options: {
    collapsed: true,
    position: 'topright'
  },

  initialize: function (options) {
    L.setOptions(this, options);
  },

  onAdd: function (map) {
    this._map = map;
    this._initLayout();    
    this._addSlider();
    //this._addItem({ marker: 'geokrety_move_recent', name: 'Has moved since 3 months', checked: true});
    this._addItem({ marker: 'geokrety_move_old', name: 'GeoKrety moved more than 90 days ago'});
    this._addItem({ marker: 'geokrety_move_ghosts', name: 'GeoKrety present in cache', statusList: true, checked: true});
    this._addItem({ marker: 'geokrety_missing', name: 'GeoKrety reported as missing', statusList: true});
    this._addItem({ marker: 'geokrety_no_move_date', name: 'GeoKrety with unknown move date'});
    return this._container;
  },

  _initLayout: function () {
    var className = 'leaflet-control-geokretyfilter',
        container = this._container = L.DomUtil.create('div', className);

    // makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
    container.setAttribute('aria-haspopup', true);

    L.DomEvent.disableClickPropagation(container);
    if (!L.Browser.touch) {
      L.DomEvent.disableScrollPropagation(container);
    }

    var form = this._form = L.DomUtil.create('form', className + '-list');

    if (this.options.collapsed) {
      if (!L.Browser.android) {
        L.DomEvent.addListener(container, 'mouseenter', this._expand, this);
        L.DomEvent.addListener(container, 'mouseleave', this._collapse, this);
      }

      var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
      link.href = '#';
      link.title = 'GeoKrety Filters';

      if (L.Browser.touch) {
        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this._expand, this);
      } else {
        L.DomEvent.on(link, 'focus', this._expand, this);
      }

      if (L.Browser.android) {
        // work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
        L.DomEvent.on(form, 'click', function () {
          setTimeout(L.bind(this._onInputClick, this), 0);
        }, this);
      }

      this._map.on('click', this._collapse, this);
      // TODO keyboard accessibility
    } else {
      this._expand();
    }

    this.createTitle('Move age', form);
    this._gkLastMovesList = L.DomUtil.create('div', className + '-lastmoves', form);
    this._separator = L.DomUtil.create('div', className + '-separator', form);
    this.createTitle('Status', form);
    this._gkStatusList = L.DomUtil.create('div', className + '-status', form);

    container.appendChild(form);
  },

  createTitle: function(title, obj) {
    var h = document.createElement('h1');
    var t = document.createTextNode(title);
    h.appendChild(t);
    obj.appendChild(h);
  },

  onRemove: function (map) {
    // when removed
    return;
  },


  _addSlider: function (obj) {
    var label = document.createElement('label');
    var slider;

    slider = document.createElement('div');
    slider.id = 'geokrety_age_slider';

    var name = document.createElement('span');
    name.innerHTML = 'GeoKrety moved between <span id="days-min">0</span> to <span id="days-max">0</span> days ago';

    // Helps from preventing layer control flicker when checkboxes are disabled
    // https://github.com/Leaflet/Leaflet/issues/2771
    var holder = document.createElement('div');

    label.appendChild(holder);
    holder.appendChild(name);
    holder.appendChild(slider);

    this._gkLastMovesList.appendChild(label);

    return label;
  },

  _addItem: function (obj) {
    var label = document.createElement('label');
    var input;

    input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'leaflet-control-geokretyfilter-selector';
    input.checked = obj.checked;
    input.id = obj.marker;

    if (L.Browser.android) {
      L.DomEvent.on(label, 'click', this._onInputClick, this);
    } else {
      L.DomEvent.on(input, 'click', this._onInputClick, this);
    }

    var name = document.createElement('span');
    name.innerHTML = ' ' + obj.name;

    // Helps from preventing layer control flicker when checkboxes are disabled
    // https://github.com/Leaflet/Leaflet/issues/2771
    var holder = document.createElement('div');

    label.appendChild(holder);
    holder.appendChild(input);
    holder.appendChild(name);

    var container = obj.statusList ? this._gkStatusList : this._gkLastMovesList;
    container.appendChild(label);

    return label;
  },

  _onInputClick: function () {
    this._map.fireEvent('dragend');
    this._refocusOnMap();
  },

  _expand: function () {
    L.DomUtil.addClass(this._container, 'leaflet-control-geokretyfilter-expanded');
    this._form.style.height = null;
    var acceptableHeight = this._map._size.y - (this._container.offsetTop + 50);
    if (acceptableHeight < this._form.clientHeight) {
      L.DomUtil.addClass(this._form, 'leaflet-control-geokretyfilter-scrollbar');
      this._form.style.height = acceptableHeight + 'px';
    } else {
      L.DomUtil.removeClass(this._form, 'leaflet-control-geokretyfilter-scrollbar');
    }
  },

  _collapse: function () {
    L.DomUtil.removeClass(this._container, 'leaflet-control-geokretyfilter-expanded');
  },

});

L.control.geokretyfilter = function(id, options) {
  return new L.Control.GeoKretyFilter(id, options);
}
