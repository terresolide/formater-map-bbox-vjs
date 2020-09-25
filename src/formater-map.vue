<template>
  <div class="fmt-wrapper">
    <div style="display:none;">
      <formater-popup v-for="(popup, index) in popups" :key="index" :properties="popup" :color="color" :lang="lang"></formater-popup>
    </div>
    <div id="fullMap" ></div>
    <div class="fmt-container">
      <div id="fmtMap" class="mtdt-small"/>
    </div>
   <div v-show="full" style="text-align:left;">
   <h4>
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
    <div class="fmt-feature" v-for="feature in features" @click="openPopup(feature)" :class="{selected: isSelected(feature)}">
     
      <div class="feature-column-1">
        {{feature.properties.location}}
      </div>
      <div class="feature-column-2">
      {{feature.properties.theme.join(', ')}}
      </div>
      <!--   <div class="feature-column-3">
        {{feature.geometry.coordinates[1].toFixed(2)}}
      </div>
       <div class="feature-column-4">
        {{feature.geometry.coordinates[0].toFixed(2)}}
      </div> -->
      <div class="feature-column-3">
      <a   v-if="feature.properties.link"  :href="feature.properties.link" target="_blank" >
         {{lang === 'en' ? 'Access to products': 'Accès aux produits'}}
      </a>
     
      <em v-if="!feature.properties.link" v-html="lang === 'en' ? 'on Going' : '&Agrave; venir'">
       {}
      </em>
       </div>
     </div>
    </div>
  </div>
</template>
<script>

var L = require('leaflet');
L.Control.Fullscreen = require('formater-metadata-vjs/src/modules/leaflet.control.fullscreen.js')
L.Control.Reset = require('./leaflet.control.reset.js')
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
    color: {
      type: String,
      default:'#3d5c7a'
    },
    removeId: {
      type: String,
      default: null
    },
    first: {
      type: Number,
      default: null
    },
    full: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      map: null,
      layers: null,
      features: [],
      popups: [],
      selectedLayer: null,
      selectedFeature: null,
      dataUrl: process.env.DATA_URL,
      geojsonUrl: null,
      windowHeight: null,
      resizeListener: null
    }
  },
  created() {
    this.windowHeight = window.innerHeight + 'px'
    this.resizeListener = this.resize.bind(this)
    window.addEventListener('resize', this.resizeListener)
  },
  mounted () {
  //  this.union()
    this.initialize()
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeListener)
    this.resizeListener = null
  },
  methods: {
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
//     union ()  {
//       this.$http.get('/public/traces_tibet.json')
//       .then(function (resp) {
//         var geojson = resp.body
//         console.log(geojson)
//         var myUnion = null
//         geojson.features.forEach(function (feature) {
//           if (!myUnion) {
//             myUnion = feature
//           }
//           myUnion = turfUnion(myUnion, feature)
//         })
//         console.log(myUnion)
//         L.geoJSON(myUnion).addTo(this.map)
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
      if (!this.geojson) {
        this.jsonUrl = this.dataUrl + 'interfero_areas_' + this.lang + '.json'
      } else if (this.isUrl(this.geojson)){
         this.jsonUrl = this.geojson
      } else {
        var base = new URL(window.location.href)
        var r = /[^\/]*\.[a-zA-Z]{2,4}$/;
        var path = base.pathname.replace(r, '')
        this.jsonUrl = base.protocol + '//' + base.host + path + this.geojson
      }
      this.map = L.map( "fmtMap", {scrollWheelZoom: false}).setView([20, -0.09], 3);
      var _this = this
      this.map.on('popupclose', function (e) {
        _this.selectedFeature = null
      })
      
      // this.map.on( "zoom", function(e){ this.updateAllPolygons();})
      L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
          maxZoom: 18,
          minZoom:2
         }).addTo( this.map )
      var fullscreen = new L.Control.Fullscreen(
          'fullMap',
          {
            lang: this.lang,
            removeHeight: 0,
            mouseWheel: true
           }
      )
      fullscreen.addTo(this.map)
      L.control.scale().addTo(this.map)
      var reset = new L.Control.Reset(_this.lang)
      reset.addTo(_this.map)
   
      this.$http.get(this.jsonUrl).then(
        response => { this.addGeojsonLayer(response.body)}
      )
      this.map.on('zoomend', function (e) {
        if(_this.map.getZoom() > 3) {
          _this.layers.getLayers().forEach(function (layer) {
            if (layer.center)
            layer.setStyle({opacity: 1, fillOpacity: 0.2})
          })
        } else {
          _this.layers.getLayers().forEach(function (layer) {
            if (layer.center)
            layer.setStyle({opacity: 0, fillOpacity: 0})
          })
        }
      })
      this.map.on('moveend', function (e) {
        _this.updatePopup()
      })
    
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
    addGeojsonLayer (features) {
      this.features = features.features
      this.popups = []
      var _this = this
      this.features.map(function (feature, index) {
        feature.properties.theme = feature.properties.theme.sort()
        feature.properties.index = index
        feature.properties.data = feature.properties.link ? 1 : 0
        _this.popups[index] = feature.properties
      } )
      this.features.sort(function (a, b) {
        return a.properties.name > b.properties.name ? 1 : -1
      })
      var _this = this
      this.layers = L.geoJSON(features, {
         style: function (feature) {
           return {color: 'red', width: 1, fillOpacity: 0, opacity:0}
         },
         onEachFeature: function (feature, layer) {
           layer.id = feature.properties.id
          
           if (feature.geometry.type !== 'Polygon') {
	           layer.on('click', function (layer) {
	             this.unbindPopup()
	             if (_this.isSelected(feature)) {
	               _this.map.closePopup()
	               _this.selectedLayer = null
	             } else {
		             var node = document.querySelector('.popup_' + feature.properties.index)
		             this.bindPopup(node.cloneNode(true), {maxWidth:360, className: feature.properties.popup})
		             this.openPopup()
		             _this.selectedLayer = this
		             _this.selectedFeature = feature
		             
	             }
	           })
           }
        }
	    }).on('add', function () {
	       _this.map.fitBounds(_this.layers.getBounds(), {padding: [50, 50]})
	       _this.layers.getLayers().forEach(function (layer) {
               if (layer.feature.geometry.type === 'Polygon') {
                 var marker = L.marker(layer.getCenter()).addTo(_this.map)
                 layer.center = marker
                 marker.on('click', function (truc) {
                   this.unbindPopup()
                   if (_this.isSelected(layer.feature)) {
                     _this.map.closePopup()
                     _this.selectedLayer = null
                   } else {
                     var node = document.querySelector('.popup_' + layer.feature.properties.index)
                     this.bindPopup(node.cloneNode(true), {maxWidth: 360, className: layer.feature.properties.popup})
                     this.openPopup()
                     _this.selectedLayer = this
                     _this.selectedFeature = layer.feature
                     
                   }
                 })
               }
             })
                
	       if (_this.first !== null) {
	         var next = function () {
	           
	           if (_this.layers.getLayers()[_this.first]) {
	             if (_this.layers.getLayers()[_this.first].center) {
	               _this.layers.getLayers()[_this.first].center.fire('click')
	             } else {
	               _this.layers.getLayers()[_this.first].fire('click')
	             }
	           }
	         }
	         setTimeout(next, 1000)
	       }
	    })
      this.layers.addTo(this.map)
    },
    isSelected (feature) {
      return (this.selectedFeature && this.selectedFeature.properties.id === feature.properties.id)
    },
    openPopup (feature) {
      // find the good layer
      var selectedLayer = this.layers.getLayers().find(obj => obj.id === feature.properties.id)
      if (selectedLayer.center) {
        selectedLayer.center.fire('click')
      } else {
        selectedLayer.fire('click')
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
.fmt-wrapper {
  line-height: 1.7;
}
.fmt-wrapper h4 {
 margin: 5px 0 3px 0;
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
  grid-template-columns: minmax(253px,1fr) minmax(250px,2fr) 140px;
  grid-gap: 3px;
  /*grid-auto-rows: minmax(100px, auto);*/
  border-bottom:1px solid lightgrey;
  cursor: pointer;
}
div.fmt-feature.feature-header{
  font-weight:800;
  border-bottom: 1px solid darkgrey;
  border-top: 1px solid darkgrey;
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
div.fmt-feature:nth-child(2n) {
  background-color:#f3F3F3;
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
div.fmt-feature .feature-column-3 {
  grid-column: 3;
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