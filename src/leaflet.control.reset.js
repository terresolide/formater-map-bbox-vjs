/**
 * 
 */

 L.Control.Reset= L.Control.extend({
    options: {
        position: 'topright',
    },  
    _lang: 'en',
    _bounds: [
      [-21.7,-99.5],
      [ 43.1,96]],
    _translate: {
      'en': {
        'reset': 'Reset'
      },
      'fr': {
        'reset': 'Initialiser'
      }
    },
    initialize: function(lang, bounds){
        this.setLang(lang)
        this.setBounds(bounds)
    },
    setBounds (bounds) {
      if (bounds) {
        this._bounds = bounds
      }
    },
    setLang (lang) {
      this._lang = (['en', 'fr'].indexOf(lang) >=0 ? lang : 'en')
    },
    onAdd : function(map){
        
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control lfh-control-reset');
        var a = L.DomUtil.create('a', 'fa fa-undo')
        a.setAttribute('title', this._translate[this._lang]['reset'])
        var _this = this
        L.DomEvent.disableClickPropagation(a)
        L.DomEvent.addListener(a, 'click', function (e) {
          map.fitBounds(_this._bounds, {padding: [50, 50]})
        })
        container.appendChild(a)
        
        return container;
    }
})

module.exports = L.Control.Reset