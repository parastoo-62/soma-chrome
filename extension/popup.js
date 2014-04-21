var SomaPlayerPopup;

SomaPlayerPopup = (function() {
  function SomaPlayerPopup() {
    console.debug('popup opened');
    this.station_select = $('#station');
    this.play_button = $('#play');
    this.pause_button = $('#pause');
    this.current_info_el = $('#currently-playing');
    this.title_el = $('span#title');
    this.artist_el = $('span#artist');
    this.station_select.change((function(_this) {
      return function() {
        return _this.station_changed();
      };
    })(this));
    this.play_button.click((function(_this) {
      return function() {
        return _this.play();
      };
    })(this));
    this.pause_button.click((function(_this) {
      return function() {
        return _this.pause();
      };
    })(this));
    this.station_select.keypress((function(_this) {
      return function(e) {
        if (e.keyCode === 13) {
          if (!(_this.play_button.is(':disabled') || _this.play_button.hasClass('hidden'))) {
            console.debug('pressing play button');
            _this.play_button.click();
          }
          if (!(_this.pause_button.is(':disabled') || _this.pause_button.hasClass('hidden'))) {
            console.debug('pressing pause button');
            return _this.pause_button.click();
          }
        }
      };
    })(this));
    this.load_current_info();
    this.handle_links();
  }

  SomaPlayerPopup.prototype.load_current_info = function() {
    this.station_select.attr('disabled', 'disabled');
    return SomaPlayerUtil.send_message({
      action: 'info'
    }, (function(_this) {
      return function(info) {
        console.debug('finished info request, info', info);
        _this.station_select.val(info.station);
        _this.station_select.removeAttr('disabled');
        _this.station_select.trigger('change');
        if (info.station !== '') {
          _this.station_is_playing();
        }
        if (info.artist || info.title) {
          _this.title_el.text(info.title);
          _this.artist_el.text(info.artist);
          return _this.current_info_el.removeClass('hidden');
        }
      };
    })(this));
  };

  SomaPlayerPopup.prototype.station_is_playing = function() {
    this.pause_button.removeClass('hidden');
    return this.play_button.addClass('hidden');
  };

  SomaPlayerPopup.prototype.play = function() {
    var station;
    this.station_select.attr('disabled', 'disabled');
    station = this.station_select.val();
    console.debug('play button clicked, station', station);
    return SomaPlayerUtil.send_message({
      action: 'play',
      station: station
    }, (function(_this) {
      return function() {
        console.debug('finishing telling station to play');
        return _this.station_is_playing();
      };
    })(this));
  };

  SomaPlayerPopup.prototype.pause = function() {
    var station;
    station = this.station_select.val();
    console.debug('pause button clicked, station', station);
    return SomaPlayerUtil.send_message({
      action: 'pause',
      station: station
    }, (function(_this) {
      return function() {
        console.debug('finished telling station to pause');
        _this.pause_button.addClass('hidden');
        _this.play_button.removeClass('hidden');
        _this.station_select.removeAttr('disabled');
        _this.current_info_el.addClass('hidden');
        _this.title_el.text('');
        return _this.artist_el.text('');
      };
    })(this));
  };

  SomaPlayerPopup.prototype.station_changed = function() {
    var station;
    station = this.station_select.val();
    console.debug('station changed to', station);
    if (station === '') {
      return this.play_button.attr('disabled', 'disabled');
    } else {
      return this.play_button.removeAttr('disabled');
    }
  };

  SomaPlayerPopup.prototype.handle_links = function() {
    return $('a').click(function(e) {
      var link, url;
      e.preventDefault();
      link = $(this);
      if (link.attr('href') === '#options') {
        url = chrome.extension.getURL('options.html');
      } else {
        url = link.attr('href');
      }
      chrome.tabs.create({
        url: url
      });
      return false;
    });
  };

  return SomaPlayerPopup;

})();

document.addEventListener('DOMContentLoaded', function() {
  return new SomaPlayerPopup();
});
