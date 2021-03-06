var SomaPlayerOptions;

SomaPlayerOptions = (function() {
  function SomaPlayerOptions() {
    var radio_selector;
    this.status_area = $('#status-message');
    this.lastfm_button = $('button.lastfm-auth');
    this.disable_scrobbling = $('#disable_scrobbling');
    this.enable_scrobbling = $('#enable_scrobbling');
    this.disable_notifications = $('#disable_notifications');
    this.enable_notifications = $('#enable_notifications');
    this.light_theme = $('#light_theme');
    this.dark_theme = $('#dark_theme');
    this.lastfm_connected_message = $('#lastfm-is-authenticated');
    this.lastfm_not_connected_message = $('#lastfm-is-not-authenticated');
    this.lastfm_user = $('#lastfm-user');
    this.lastfm_disconnect = $('#lastfm-disconnect');
    this.stations_divider = $('.stations-divider');
    this.stations_options = $('.stations-options');
    this.station_count = $('.station-count');
    this.stations_list = $('.stations-list');
    this.refresh_stations_button = $('button.refresh-stations');
    this.lastfm_token = SomaPlayerUtil.get_url_param('token');
    this.options = {
      scrobbling: false,
      notifications: true
    };
    this.lastfm_button.click((function(_this) {
      return function() {
        return _this.init_authenticate_lastfm();
      };
    })(this));
    this.lastfm_disconnect.click((function(_this) {
      return function(event) {
        event.preventDefault();
        return _this.disconnect_from_lastfm();
      };
    })(this));
    radio_selector = 'input[name="scrobbling"], input[name="notifications"], ' + 'input[name="theme"]';
    $(radio_selector).change((function(_this) {
      return function() {
        return _this.save_options();
      };
    })(this));
    this.refresh_stations_button.click((function(_this) {
      return function() {
        return _this.refresh_stations();
      };
    })(this));
    this.restore_options();
    this.authenticate_lastfm();
  }

  SomaPlayerOptions.prototype.restore_options = function() {
    return SomaPlayerUtil.get_options((function(_this) {
      return function(opts) {
        var key, value;
        if (opts.lastfm_session_key) {
          _this.lastfm_connected_message.removeClass('hidden');
          _this.enable_scrobbling.removeAttr('disabled');
        } else {
          _this.lastfm_not_connected_message.removeClass('hidden');
        }
        if (opts.lastfm_user) {
          _this.lastfm_user.text(opts.lastfm_user);
          _this.lastfm_user.attr('href', "http://last.fm/user/" + opts.lastfm_user);
        }
        if (opts.scrobbling) {
          _this.enable_scrobbling.attr('checked', 'checked');
        }
        if (opts.notifications === false) {
          _this.disable_notifications.attr('checked', 'checked');
        }
        if (opts.stations !== null && opts.stations.length > 0) {
          _this.show_cached_stations(opts.stations);
        }
        if (opts.theme === 'dark') {
          _this.dark_theme.attr('checked', 'checked');
        }
        for (key in opts) {
          value = opts[key];
          _this.options[key] = value;
        }
        $('.controls.hidden').removeClass('hidden');
        console.debug('SomaPlayer options:', _this.options);
        _this.lastfm_button.removeClass('hidden');
        return _this.apply_theme();
      };
    })(this));
  };

  SomaPlayerOptions.prototype.apply_theme = function() {
    var theme;
    theme = this.options.theme || 'light';
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.remove('theme-light');
    }
    return document.body.classList.add('theme-' + theme);
  };

  SomaPlayerOptions.prototype.show_cached_stations = function(stations) {
    var s, text_list, titles;
    this.stations_divider.show();
    this.stations_options.show();
    this.station_count.text(stations.length);
    titles = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = stations.length; _i < _len; _i++) {
        s = stations[_i];
        _results.push(s.title);
      }
      return _results;
    })();
    titles.sort();
    text_list = titles.slice(0, titles.length - 1).join(', ');
    text_list += ', and ' + titles[titles.length - 1] + '.';
    return this.stations_list.text(text_list);
  };

  SomaPlayerOptions.prototype.refresh_stations = function() {
    var msg;
    console.debug('refreshing stations list');
    this.stations_list.text('');
    this.refresh_stations_button.prop('disabled', true);
    msg = {
      action: 'fetch_stations'
    };
    return SomaPlayerUtil.send_message(msg, (function(_this) {
      return function(stations, error) {
        if (error) {
          _this.stations_list.text('Could not fetch station list. :(');
        } else {
          _this.show_cached_stations(stations);
        }
        _this.options.stations = stations;
        return _this.refresh_stations_button.prop('disabled', false);
      };
    })(this));
  };

  SomaPlayerOptions.prototype.disconnect_from_lastfm = function() {
    console.debug('disconnecting from Last.fm...');
    this.options.lastfm_session_key = null;
    this.options.lastfm_user = null;
    this.options.scrobbling = false;
    return SomaPlayerUtil.set_options(this.options, (function(_this) {
      return function() {
        _this.status_area.text('Disconnected from Last.fm!').fadeIn(function() {
          return setTimeout((function() {
            return _this.status_area.fadeOut();
          }), 2000);
        });
        _this.lastfm_user.text('');
        _this.lastfm_connected_message.addClass('hidden');
        _this.lastfm_not_connected_message.removeClass('hidden');
        _this.enable_scrobbling.attr('disabled', 'disabled');
        _this.enable_scrobbling.removeAttr('checked');
        return _this.disable_scrobbling.attr('checked', 'checked');
      };
    })(this));
  };

  SomaPlayerOptions.prototype.save_options = function() {
    var checked_notifications, checked_scrobbling, checked_theme;
    checked_scrobbling = $('input[name="scrobbling"]:checked');
    this.options.scrobbling = checked_scrobbling.val() === 'enabled';
    checked_notifications = $('input[name="notifications"]:checked');
    this.options.notifications = checked_notifications.val() === 'enabled';
    checked_theme = $('input[name="theme"]:checked');
    this.options.theme = checked_theme.val();
    return SomaPlayerUtil.set_options(this.options, (function(_this) {
      return function() {
        return _this.status_area.text('Saved your options!').fadeIn(function() {
          window.scrollTo(0, 0);
          setTimeout((function() {
            return _this.status_area.fadeOut();
          }), 2000);
          return _this.apply_theme();
        });
      };
    })(this));
  };

  SomaPlayerOptions.prototype.init_authenticate_lastfm = function() {
    return window.location.href = 'http://www.last.fm/api/auth/' + '?api_key=' + SomaPlayerConfig.lastfm_api_key + '&cb=' + window.location.href;
  };

  SomaPlayerOptions.prototype.authenticate_lastfm = function() {
    var lastfm;
    if (this.lastfm_token === '') {
      return;
    }
    console.debug('authenticating with Last.fm token...');
    lastfm = SomaPlayerUtil.get_lastfm_connection();
    return lastfm.auth.getSession({
      token: this.lastfm_token
    }, {
      success: (function(_this) {
        return function(data) {
          _this.options.lastfm_session_key = data.session.key;
          _this.options.lastfm_user = data.session.name;
          _this.options.scrobbling = true;
          return SomaPlayerUtil.set_options(_this.options, function() {
            _this.status_area.text('Connected to Last.fm!').fadeIn(function() {
              return setTimeout((function() {
                return _this.status_area.fadeOut();
              }), 2000);
            });
            _this.lastfm_user.text(_this.options.lastfm_user);
            _this.lastfm_connected_message.removeClass('hidden');
            _this.lastfm_not_connected_message.addClass('hidden');
            _this.enable_scrobbling.removeAttr('disabled');
            return _this.enable_scrobbling.attr('checked', 'checked');
          });
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          console.error('Last.fm error:', data.error, ',', data.message);
          delete _this.options['lastfm_session_key'];
          delete _this.options['lastfm_user'];
          return SomaPlayerUtil.set_options(_this.options, function() {
            return _this.status_area.text('Error authenticating with Last.fm.').fadeIn(function() {
              return setTimeout((function() {
                return _this.status_area.fadeOut();
              }), 2000);
            });
          });
        };
      })(this)
    });
  };

  return SomaPlayerOptions;

})();

$(function() {
  return new SomaPlayerOptions();
});
