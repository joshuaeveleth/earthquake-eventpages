'use strict';

var ProductView = require('core/ProductView'),
    Formatter = require('core/Formatter'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr');

var _DEFAULTS;

_DEFAULTS = {
  errorMessage: 'Error loading nearby places.',
  renderNewLayout: false
};


/**
 * View for a nearby-cities Product.
 *
 * @param options {Object}
 *    all options are passed to ProductView.
 */
var NearbyPlacesView = function (options) {
  var _this,
      _initialize,

      _errorMessage,
      _formatter,
      _renderNewLayout,
      _xhr;

  _this = ProductView(options);

  _initialize = function (options) {
    options = Util.extend({}, _DEFAULTS, options);

    _errorMessage = options.errorMessage;
    _formatter = options.formatter || Formatter();
    _renderNewLayout = options.renderNewLayout;

    _this.el.classList.add('nearby-places');
  };

  /**
   * Destroy all the things.
   */
  _this.destroy = Util.compose(function () {
    if (_xhr) {
      _xhr.abort();
      _xhr = null;
    }
    _errorMessage = null;
    _formatter = null;
    _this = null;
    _initialize = null;
  }, _this.destroy);

  /**
   * Gets the data
   */
  _this.fetchData = function () {
    var content;

    content = _this.model.getContent('nearby-cities.json');

    if (!content) {
      _this.onError();
      return;
    }

    _xhr = Xhr.ajax({
      url: content.get('url'),
      success: _this.onSuccess,
      error: _this.onError,
      done: function () {
        _xhr = null;
      }
    });
  };

  /**
   * Formats a place.
   *
   * @param place {Object}
   *     An object containing place information. Namely:
   *         "distance" {Number} (km)
   *         "direction" {String} (CompassWinds)
   *         "name" {String} (Description)
   *
   * @return {String}
   *     The formatted place markup.
   */
  _this.formatPlace = function (place) {
    var markup;

    if (_renderNewLayout) {
      markup = [
        '<li class="nearby-places-place">',
          '<span class="nearby-places-name">',
            place.name,
          '</span>',
          '<aside class="nearby-places-distance">',
            _formatter.distance(place.distance, 'km'),
            ' (',
              _formatter.distance(_formatter.kmToMi(place.distance), 'mi'),
            ') ',
            place.direction,
          '</aside>',
          '<aside class="nearby-places-population">Population: ',
            _formatter.numberWithCommas(place.population),
          '</aside>',
        '</li>'
      ];
    } else {
      markup = [
        '<li>',
          _formatter.distance(place.distance, 'km'),
          ' (',
            _formatter.distance(_formatter.kmToMi(place.distance), 'mi'),
          ') ',
          place.direction, ' of ', place.name,
        '</li>'
      ];
    }

    return markup.join('');
  };

  /**
   * This method is called when there is a problem.
   *
   * @param errorMessage {String}
   *      A description of the error that occurred.
   */
  _this.onError = function () {
    _this.el.innerHTML = _errorMessage;
    _this.trigger('places-error');
  };

  /**
   * This method is called to render nearby-cities.
   *
   * @param data {Object}
   *    The data for nearby-cities JSON.
   */
  _this.onSuccess = function (data) {
    var markup;

    // Formats nearby places
    markup = data.reduce(function (prev, item/*, idx, arr*/) {
      return prev + _this.formatPlace(item);
    }, '');


    _this.el.innerHTML = '<ul class="no-style">' + markup + '</ul>';
    _this.trigger('places', data);
  };

  /**
   * Called when the model changes. Initially sets a loading message then starts
   * the data fetch process to render the actual content. Relies on browser
   * caches to avoid duplicate HTTP overhead.
   */
   _this.render = function () {
     _this.el.innerHTML = 'Loading content&hellip;';
     _this.fetchData();
   };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = NearbyPlacesView;
