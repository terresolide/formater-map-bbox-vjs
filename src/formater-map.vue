<template>
  <div class="fmt-wrapper">
    <div style="display:none;">
    <span v-for="group, i in popups">
      <span v-for="(popup, index) in group">
         <formater-popup  :key="index" :group="i" :properties="popup" :catalog-url="catalogUrl" :color="colors[i]" :lang="lang"></formater-popup>
      </span>
    </span>
    </div>
    <div id="fullMap" ></div>
    <div class="fmt-container">
      <div id="fmtMap" class="mtdt-small"/>
    </div>
   <div v-show="full" style="text-align:left;">
   <h4 id="flatsim_site">
   {{ lang === 'en' ? 'Selected Areas' : 'Zones sélectionnées' }}
   </h4>
    <div class="fmt-feature feature-header">
     
      <div class="feature-column-1">
        <span>{{lang === 'en' ? 'Location' : 'Localisation'}}</span>
      <!--     <div class="button" @click="sort('location', 1)">&darr;</div>
         <div class="button" @click="sort('location', -1)">&uarr;</div>
         -->
      </div>
      <div class="feature-column-2">
       <span>  {{ lang === 'en' ? 'Themes' : 'Thèmes' }}</span>
      </div>
      <div class="feature-column-2-bis">
       <span>  {{ lang === 'en' ? 'Leaders' : 'Porteurs' }}</span>
      </div>
     <!--  <div class="feature-column-3">
        <span>Lat</span>
        <div class="button" @click="sort('lat', 1)">&darr;</div>
        <div class="button" @click="sort('lat', -1)">&uarr;</div>
      </div>
      <div class="feature-column-4">
        <span>Lng</span>
        <div class="button" @click="sort('lng', 1)">&darr;</div>
        <div class="button" @click="sort('lng', -1)">&uarr;</div>
      </div>  -->
      <div class="feature-column-3">
         <span>{{lang === 'en' ? 'Products': 'Produits'}}</span>
       <!--  
         <div class="button" @click="sort('id', 1)">&darr;</div>
         <div class="button" @click="sort('id', -1)">&uarr;</div>
      --> 
      </div>
    </div>
    <div v-for="collection, i in features">
      <div class="feature-group" :class="{hidden: !onMap[i]}" >
       
        {{groups[i].name}}
         <span class="clickable" @click="toggleGroup(i)">{{onMap[i] ? '-' : '+' }}</span>
      </div>
      <div>
		    <div class="fmt-feature" v-for="feature in collection" @click="openPopup(feature, i)" :class="{selected: isSelected(feature)}">
		     
		      <div class="feature-column-1">
		        {{feature.properties.location}}
		      </div>
		      <div class="feature-column-2">
		      {{feature.properties.theme.join(', ')}}
		      </div>
		      <div class="feature-column-2-bis">
		        <span v-if="feature.properties.leaders && contact">
		          <a :href="'mailto:' + contact + '?subject=[FLATSIM] ' + feature.properties.name">
		              {{ feature.properties.leaders.join(',')}}
		          </a>
		        </span>
		        <span v-else-if="feature.properties.leaders && !contact" >
		           <span v-for="leader in feature.properties.leaders" class="leader">
		             {{leader}}
		           </span>
		        </span>
		        
		      </div>
		      <!--   <div class="feature-column-3">
		        {{feature.geometry.coordinates[1].toFixed(2)}}
		      </div>
		       <div class="feature-column-4">
		        {{feature.geometry.coordinates[0].toFixed(2)}}
		      </div> -->
		      <div class="feature-column-3">
		      <a   v-if="feature.properties.uuid"  :href="catalogUrl + 'metadata/' + feature.properties.uuid" target="_blank" >
		         {{lang === 'en' ? 'Access to products': 'Accès aux produits'}}
		      </a>
		     
		      <em v-if="!feature.properties.uuid" v-html="lang === 'en' ? 'on Going' : '&Agrave; venir'">
		       {}
		      </em>
		       </div>
		     </div>
	     </div>
	   </div>
    </div>
  </div>
</template>
<script>

var L = require('leaflet');
L.Control.Fullscreen = require('formater-commons-components-vjs/src/leaflet/leaflet.control.fullscreen.js')
L.Control.Reset = require('./leaflet.control.reset.js')
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
import FormaterPopup from './formater-popup.vue'
// import turfUnion from '@turf/union'
export default {
  name: 'FormaterMap',
  components: {
    FormaterPopup
  },
  props: {
    lang: {
      type: String,
      default: 'en'
    },
    geojson: {
      type: String,
      default: null
    },
    bbox: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default:'#3d5c7a'
    },
    removeId: {
      type: String,
      default: null
    },
    first: {
      type: Number|String,
      default: null
    },
    full: {
      type: Boolean,
      default: true
    },
    contact: {
      type: String,
      default: null
    },
    catalogUrl: {
      type: String,
      default: 'https://www.poleterresolide.fr/acces-aux-donnees/catalogue/#/'
    }
  },
  data () {
    return {
      map: null,
      colors: ['#0d75ff', '#E50000', '#F07814'],
      icons: [],
      bounds: null,
      layers: [],
      features: [],
      popups: [],
      groups: [],
      selectedLayer: null,
      selectedFeature: null,
      dataUrl: process.env.DATA_URL,
      geojsonUrl: [],
      windowHeight: null,
      resizeListener: null,
      controlLayers: null,
      onMap: [],
    }
  },
  created() {
    this.windowHeight = window.innerHeight + 'px'
    this.resizeListener = this.resize.bind(this)
    window.addEventListener('resize', this.resizeListener)
  },
  mounted () {
    this.initUrl()
    this.initialize()
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeListener)
    this.resizeListener = null
  },
  methods: {
    initUrl () {
      var self = this
      
      if (!this.geojson) {
        this.geojsonUrl[0] = this.dataUrl + 'interfero_areas_' + this.lang + '.json'
      } else {
        var geojson = eval(this.geojson)
        geojson.forEach(function (url, i) {
          if (self.isUrl(url)) {
            self.geojsonUrl[i] = url
          } else {
            var base = new URL(window.location.href)
            var r = /[^\/]*\.[a-zA-Z]{2,4}$/;
            var path = base.pathname.replace(r, '')
            self.geojsonUrl[i] = base.protocol + '//' + base.host + path + url
          }
        })
      }
    },
    resize () {
      this.windowHeight = window.innerHeight
      var node = this.$el.querySelector('#fullMap > div')
      if (node) {
        node.style.height = this.windowHeight + 'px'
      }
      if (this.map) {
        this.map.invalidateSize()
      }
    },
    isUrl (url) {
      try  {
        new URL(url)
      } catch (e) {
        return false
      }
      return true
    },
//     finalUnion (result, name) {
//       var myUnion = null
//       result.forEach(function (feature) {
//         if (!myUnion) {
//           myUnion = feature
//         } else {
//           myUnion = turfUnion(myUnion, feature)
//         }
//       })
//       L.geoJSON(myUnion, {style: {color: '#F07814'}}).addTo(this.map)
//       myUnion.properties = {}
//       let dataStr = JSON.stringify(myUnion);
//       let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

//       let exportFileDefaultName = name + '.json';

//       let linkElement = document.createElement('a');
//       linkElement.setAttribute('href', dataUri);
//       linkElement.setAttribute('download', exportFileDefaultName);
//       linkElement.click();
//     },
//     union (data, name)  {
//       var self = this
//       var result = Array(data.length).fill(false, 0, data.length)
//       console.log(result)
//       data.forEach(function (file, i) {
// 	      self.$http.get('/public/ai2/' + name + '/' + file)
// 	      .then(function (resp) {
// 	        var geojson = resp.body
// 	        var myUnion = null
// 	        if (geojson.type === 'FeatureCollection') {
// 		        geojson.features.forEach(function (feature) {
// 		          if (!myUnion) {
// 		            myUnion = feature
// 		          }
// 		          myUnion = turfUnion(myUnion, feature)
// 		        })
// 	        } else {
// 	          myUnion = geojson
// 	        }
// 	        result[i] = myUnion
// 	        console.log(result[i])
// 	        var terminated = result.every(element => element !== false)
// 	        console.log(terminated)
// 	        if (terminated) {
// 	           self.finalUnion(result, name)
// 	        }
// 	      })
//       })
//     },
    initialize () {
      // remove static node
      if (this.removeId) {
	      var node = document.querySelector('#' + this.removeId)
	      if (node) {
	        node.innerHTML = ''
	      }
      }
     
      this.map = L.map( "fmtMap", {scrollWheelZoom: false}).setView([20, -0.09], 3);
      var _this = this
      this.map.on('popupclose', function (e) {
        _this.selectedFeature = null
      })
      this.controlLayers = L.control.layers({}, {})
      var tiles = {
        osm: {
          name: 'OpenStreetMap',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        },
        arcgisTopo: {
          name: 'ArcGIS World Topo Map',
          url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
        },
        arcgisSatellite: {
          name: 'ArcGIS Satellite Tiles',
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">Arcgis</a>'
        }
      }
      for (var key in tiles) {
        var layer = L.tileLayer(tiles[key].url, {attribution: tiles[key].attribution})
        this.controlLayers.addBaseLayer(layer, tiles[key].name)
        if (key === 'arcgisTopo') {
          layer.addTo(this.map)
        }
      }
      
      var fullscreen = new L.Control.Fullscreen(
          'fullMap',
          {
            lang: this.lang,
            removeHeight: 0,
            mouseWheel: true
           }
      )
      var colors = ['blue', 'red', 'orange']
      for (var i in colors) {
        this.icons[i] = new L.Icon({
         // iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('./assets/img/marker-icon-' + colors[i] + '.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
          iconRetinaUrl: require('./assets/img/marker-icon-2x-' + colors[i]+ '.png'),
         // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      }
      fullscreen.addTo(this.map)
      L.control.scale().addTo(this.map)
      var reset = new L.Control.Reset(this.lang)
      reset.addTo(this.map)
      this.controlLayers.addTo(this.map)
      if (this.bbox) {
        var bounds = this.bbox.split(',')
        if(bounds.length === 4) {
           this.bounds = [[parseFloat(bounds[1]), parseFloat(bounds[0])],
                          [parseFloat(bounds[3]), parseFloat(bounds[2])]]
        }
        this.map.fitBounds(this.bounds)
      }
      var self = this
      this.geojsonUrl.forEach(function(url, i) {
        self.$http.get(url).then(
            response => { self.addGeojsonLayer(response.body, i)}
        )
      })
     
//       this.map.on('zoomend', function (e) {
//         if(_this.map.getZoom() > 3) {
//           _this.layers.getLayers().forEach(function (layer) {
//             if (layer.center)
//             layer.setStyle({opacity: 1, fillOpacity: 0.2})
//           })
//         } else {
//           _this.layers.getLayers().forEach(function (layer) {
//             if (layer.center)
//             layer.setStyle({opacity: 0, fillOpacity: 0})
//           })
//         }
//       })
      this.map.on('moveend', function (e) {
        _this.updatePopup()
      })
    
    },
    toggleGroup (i) {
      if (this.map.hasLayer(this.layers[i])) {
        this.layers[i].remove()
      } else {
        this.layers[i].addTo(this.map)
      }
    },
    updatePopup () {
      if (this.selectedLayer) {
        var popup = document.querySelector('.leaflet-popup')
       if (popup) {
         var latlng =  this.selectedLayer.getLatLng()
         var containerPoint = this.map.latLngToContainerPoint(latlng);
         var mapHeight = document.querySelector('#fmtMap').clientHeight;
	      if (containerPoint && containerPoint.y < 250) {
	        popup.classList.add('fmt-under')
	      } else {
	        popup.classList.remove('fmt-under')
	      }
       }
      }
    },
    addGeojsonLayer (features, i) {
      this.features[i]= features.features
      this.groups[i] = {
          name: features.properties.name, 
          short: features.properties.short ? features.properties.short : features.properties.name
            
      }
      var popups = []
      var _this = this
      this.features[i].map(function (feature, index) {
        feature.properties.theme = feature.properties.theme.sort()
        feature.properties.index = index
        feature.properties.data = feature.properties.link ? 1 : 0
        popups[index] = feature.properties
      })
      this.$set(this.popups, i, popups)
      this.features[i].sort(function (a, b) {
        return a.properties.name > b.properties.name ? 1 : -1
      })
      var _this = this
      this.layers[i] = L.geoJSON(features, {
         style: function (feature) {
           return {color: _this.colors[i], width: 1, fillOpacity: 0.2, opacity:1}
         },
         onEachFeature: function (feature, layer) {
           layer.id = feature.properties.id
          
           if (feature.geometry.type !== 'Polygon') {
	           layer.on('mouseover', function (layer) {
// 	             this.unbindPopup()
// 	             if (_this.isSelected(feature)) {
// 	               _this.map.closePopup()
// 	               _this.selectedLayer = null
// 	             } else {
//                console.log('.popup_' + i + '_' + feature.properties.index)
		             var node = document.querySelector('.popup_' + i + '_' + feature.properties.index)
		            
		             this.bindPopup(node.cloneNode(true), {maxWidth:360, className: feature.properties.popup})
		             this.openPopup()
		             _this.selectedLayer = this
		             _this.selectedFeature = feature
		             
	             // }
	           })
           }
        }
	    }).on('add', function () {
	      if (!_this.bbox) {
	       if (!_this.bounds) {
	         _this.bounds = _this.layers[i].getBounds()
	       } else {
	         _this.bounds.extend(_this.layers[i].getBounds())
	       }
	       _this.map.fitBounds(_this.bounds, {padding: [50, 50]})
	      }
	       _this.layers[i].getLayers().forEach(function (layer) {
               if (layer.feature.geometry.type === 'Polygon') {
                 var marker = L.marker(layer.getCenter(), {icon: _this.icons[i]}).addTo(_this.map)
                 layer.center = marker
                 marker.on('click', function (event) {
                   event.preventDefault()
                 })
                 marker.on('mouseover', function (truc) {
                   this.unbindPopup()
//                    if (_this.isSelected(layer.feature)) {
//                      _this.map.closePopup()
//                      _this.selectedLayer = null
//                    } else {
                     var node = document.querySelector('.popup_' + i + '_' + layer.feature.properties.index)
                     this.bindPopup(node.cloneNode(true), {maxWidth: 360, className: layer.feature.properties.popup})
                     this.openPopup()
                     _this.selectedLayer = this
                     _this.selectedFeature = layer.feature
                 })
               }
             })
         _this.$set(_this.onMap, i, true)
	       if (_this.first !== null && i === _this.geojsonUrl.length - 1) {
	         var next = function () {
	           var position = _this.first.split(',')
	           var x = parseInt(position[0])
	           var y = parseInt(position[1])
	           if (_this.layers[x].getLayers()[y]) {
	             if (_this.layers[x].getLayers()[y].center) {
	               _this.layers[x].getLayers()[y].center.fire('mouseover')
	             } else {
	               _this.layers[x].getLayers()[y].fire('mouseover')
	             }
	           }
	         }
	         setTimeout(next, 1000)
	       }
	    })
	    this.layers[i].on('remove', function() {
	      _this.layers[i].getLayers().forEach(function (layer) {
           if (!layer.center) {
             return
           }
	         layer.center.off('click')
	         layer.center.off('mouseover')
	         layer.center.remove()
        })
        _this.$set(_this.onMap, i, false)
	    })
      this.layers[i].addTo(this.map)
      this.onMap[i] = true
      this.controlLayers.addOverlay(this.layers[i],  this.groups[i].short +'<span class="square" style="background:' + this.colors[i] + '">')
    },
    isSelected (feature) {
      return (this.selectedFeature && this.selectedFeature.properties.id === feature.properties.id)
    },
    openPopup (feature,i) {
      // find the good layer
      var selectedLayer = this.layers[i].getLayers().find(obj => obj.id === feature.properties.id)
      if (selectedLayer.center) {
        selectedLayer.center.fire('mouseover')
      } else {
        selectedLayer.fire('mouseover')
      }
    },
    sort (column, direction) {
      switch (column) {
      case 'lat':
        
      case 'lng':
        var i = column === 'lat' ? 1 : 0
        this.features.sort(function (a, b) {
          var isBigger = (direction > 0) ? (a.geometry.coordinates[i] > b.geometry.coordinates[i]) : (a.geometry.coordinates[i] < b.geometry.coordinates[i])
          return isBigger ? 1 : -1
        })
        break;
      default:
        this.features.sort(function (a, b) {
          var isBigger = (direction > 0) ? (a.properties[column] > b.properties[column]) : (a.properties[column] < b.properties[column])
          return isBigger ? 1 : -1
        })
      }
      
    }
  }
}
</script>
<style>
.fmt-wrapper .leaflet-touch .leaflet-control-layers-toggle {
  width: 30px;
  height: 30px;
}
.fmt-wrapper .leaflet-control-layers-list {
  text-align:left;
}
div.feature-group.hidden + div {
  display: none;
}
span.square {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: middle;
  margin: 0 3px;
}
.clickable {
  display:inline-block;
  padding:1px 2px;
  line-height:1.1;
  min-width:15px;
  text-align:center;
  border-radius:4px;
  border:1px dotted transparent;
  cursor: pointer;
}
.clickable:hover {
  border-color:black;
  background:lightgrey;
}
.fmt-wrapper {
  line-height: 1.7;
}
.fmt-wrapper h4 {
 margin: 5px 0 3px 0;
}
.leader {
  display: inline-block;
}
.leader::after {
  content:', ';
  margin-right:5px;
}
.leader:last-child::after {
  content: '';
  margin:0;
}
div.fmt-wrapper{
  width: 100%;
     max-width:1200px;
  text-align:center;
}
div.fmt-container{
   position:relative;
   height:500px;
   margin: auto;
}
div[id="fullMap"] {
 position:fixed;
 top:0;
 left:0;
 width:100%;
 z-index:1000;
}
div[id="fmtMap"] {
  position:relative;
  min-height: 500px;
  width:100%;
  z-index:20;
}
div[id="fmtMap"].mtdt-small {
  max-height:500px;
}
div.fmt-feature {
  display: grid;
  grid-template-columns: minmax(253px,1fr) minmax(250px,1fr) minmax(200px, 1fr) 140px;
  grid-gap: 3px;
  /*grid-auto-rows: minmax(100px, auto);*/
  border-bottom:1px solid lightgrey;
  cursor: pointer;
}

div.feature-group {
  background-color:#e1e1e1;
  padding: 1px 4px;
  font-weight:800;
  border-bottom: 1px dotted darkgrey;
  border-top: 1px dotted darkgrey;
  font-size:0.9rem;
}
div.fmt-feature.feature-header span {
  line-height: 1;
  vertical-align: middle;
}
div.fmt-feature div.button {
  display: inline-block;
  margin:0 1px;
  font-size:20px;
  vertical-align: top;
  cursor:pointer;
  opacity:0.9;
}
div.fmt-feature div.button:hover {
 opacity:1;
 border: 1px dotted grey;
}
div.fmt-feature:nth-child(2n ) {
  background-color:#f3F3F3;
}
div.fmt-feature.feature-header {
  font-weight:800;
  border-bottom: 1px solid darkgrey;
  border-top: 1px solid darkgrey;
  background-color:#e1e1e1;
}
div.fmt-feature.selected {
  background-color:#faebd7;
}
div.fmt-feature .feature-column-1 {
  grid-column: 1;
  grid-row: 1/2;
  color:#darkgrey;
  font-size:0.9rem;
  padding:0px 4px;
  word-break:break-all;
}
div.fmt-feature .feature-column-2 {
  grid-column: 2;
  grid-row: 1/2;
}
div.fmt-feature .feature-column-2-bis {
  grid-column: 3;
  grid-row: 1/2;
}
div.fmt-feature .feature-column-3 {
  grid-column: 4;
  grid-row: 1/2;
}
/* div.fmt-feature .feature-column-4 {
  grid-column: 4;
  grid-row: 1/2;
}
div.fmt-feature .feature-column-5 {
  grid-column: 5;
  grid-row: 1/2;
}*/
.leaflet-popup.fmt-under {top: 40px !important;}
/* I moved the "tip" to the right location, but don't succeed in making it visible. */
.leaflet-popup.fmt-under .leaflet-popup-tip-container {
      top: 0px !important;
      overflow: auto important!;
 }
.leaflet-popup.fmt-under .leaflet-popup-tip {
      box-shadow: none !important;
      background-clip: none !important;
 }
.leaflet-popup.fmt-under:before 
        {
        content: "";
        position: absolute;
        border: 7px solid transparent;
        border-bottom-color: white;
        bottom: 0px;
        margin-left: -13px;
        }
        @media screen and (max-height: 800px) {
        div.fmt-feature {
   line-height:1.2;
  }
        }
@media screen and (max-height: 700px) {
  div.fmt-container{
   height:400px;
  }

	div[id="fmtMap"] {
	  min-height: 400px;
	}
	div[id="fmtMap"].mtdt-small {
	  max-height:400px;
	}
	
}
</style>