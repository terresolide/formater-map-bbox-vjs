<template>
  <div class="fmt-wrapper">
    <div style="display:none;">
      <formater-popup v-for="(popup, index) in popups" :key="index" :properties="popup" :color="color" :lang="lang"></formater-popup>
    </div>
    <div class="fmt-container">
      <div id="fmtMap" />
    </div>
   <div v-show="full" style="text-align:left;">
   <h4>
   {{ lang === 'en' ? 'Selected Areas' : 'Zones sélectionnées' }}
   </h4>
    <div class="fmt-feature feature-header">
      <div class="feature-column-1">
         <span>Code</span>
         <div class="button" @click="sort('id', 1)">&darr;</div>
         <div class="button" @click="sort('id', -1)">&uarr;</div>
      </div>
      <div class="feature-column-2">
        <span>{{lang === 'en' ? 'Location' : 'Localisation'}}</span>
         <div class="button" @click="sort('location', 1)">&darr;</div>
         <div class="button" @click="sort('location', -1)">&uarr;</div>
      </div>
      <div class="feature-column-3">
        <span>Lat</span>
        <div class="button" @click="sort('lat', 1)">&darr;</div>
        <div class="button" @click="sort('lat', -1)">&uarr;</div>
      </div>
      <div class="feature-column-4">
        <span>Lng</span>
        <div class="button" @click="sort('lng', 1)">&darr;</div>
        <div class="button" @click="sort('lng', -1)">&uarr;</div>
      </div>
      <div class="feature-column-5">
         <span>{{lang === 'en' ? 'Data': 'Données'}}</span>
         <div class="button" @click="sort('id', 1)">&darr;</div>
         <div class="button" @click="sort('id', -1)">&uarr;</div>
      </div>
    </div>
    <div class="fmt-feature" v-for="feature in features" @click="openPopup(feature)" :class="{selected: isSelected(feature)}">
      <div class="feature-column-1">
        {{feature.properties.id}}
      </div>
      <div class="feature-column-2">
        {{feature.properties.location}}
      </div>
       <div class="feature-column-3">
        {{feature.geometry.coordinates[1].toFixed(2)}}
      </div>
       <div class="feature-column-4">
        {{feature.geometry.coordinates[0].toFixed(2)}}
      </div>
      <div class="feature-column-5">
      <a   v-if="feature.properties.link"  :href="feature.properties.link" target="_blank" >
         {{lang === 'en' ? 'Data Access': 'Accès Données'}}
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
console.log(process.env)
var L = require('leaflet');
import FormaterPopup from './formater-popup.vue'
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
      popupLayer: null,
      selectedFeature: null,
      dataUrl: process.env.DATA_URL,
      geojsonUrl: null
    }
  },
  mounted () {
    var url = 'https://www.poleterresolide.fr/acces-donnees/catalog?state=truc&chose=bidule'
    console.log(process.env)
    this.initialize()
  },
  methods: {
    isUrl (url) {
      try  {
        new URL(url)
      } catch (e) {
        return false
      }
      return true
    },
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
        this.jsonUrl = base.protocol + '//' + base.host + base.pathname + this.geojson
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
      
      this.$http.get(this.jsonUrl).then(
        response => { this.addGeojsonLayer(response.body)}
      )
    
    },
    addGeojsonLayer (features) {
      this.features = features.features
      this.popups = []
      var _this = this
      this.features.map(function (feature, index) {
        feature.properties.index = index
        feature.properties.data = feature.properties.link ? 1 : 0
        _this.popups[index] = feature.properties
      } )
      this.features.sort(function (a, b) {
        return a.properties.id > b.properties.id ? 1 : -1
      })
      var _this = this
      this.layers = L.geoJSON(features, {
//          style: function (feature) {
//            return {color: _this.color, width: 1}
//          },
         onEachFeature: function (feature, layer) {
           layer.id = feature.properties.id
           layer.on('click', function (layer) {
             this.unbindPopup()
             if (_this.isSelected(feature)) {
               _this.map.closePopup()
             } else {
	             var node = document.querySelector('.popup_' + feature.properties.index)
	             this.bindPopup(node.cloneNode(true))
	             this.openPopup()
	             _this.selectedFeature = feature
	             
             }
           })
        }
	    }).on('add', function () {
	       _this.map.fitBounds(_this.layers.getBounds(), {padding: [50, 50]})
	       if (_this.first !== null) {
	         var next = function () { _this.layers.getLayers()[_this.first].fire('click')}
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
      selectedLayer.fire('click')
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
div[id="fmtMap"] {
  position:absolute;
  min-height: 500px;
  width:100%;
  z-index:0;
}

div.fmt-feature {
  display: grid;
  grid-template-columns: minmax(253px,2fr) minmax(130px,2fr) minmax(70px, 1fr) minmax(70px, 1fr) 130px;
  grid-gap: 3px;
  min-height:26px;
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
  line-height: 36px;
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
  padding:2px 4px;
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
div.fmt-feature .feature-column-4 {
  grid-column: 4;
  grid-row: 1/2;
}
div.fmt-feature .feature-column-5 {
  grid-column: 5;
  grid-row: 1/2;
}

</style>