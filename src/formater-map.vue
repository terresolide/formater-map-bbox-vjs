<template>
  <div class="fmt-wrapper">
  <div style="text-align:left;">
    <ul style="">
    <li v-for="feature in features">
	    <a   v-if="feature.properties.link"  :href="feature.properties.link"  >
	       {{feature.properties.name}}
	    </a>
	     <div class="disabled" v-if="!feature.properties.link">
	     {{feature.properties.name}}
	     ({{lang === 'en' ? 'on Going' : 'A venir'  }})</div>
    </li>
   
    </ul> 
    </div>
     <div>
    <formater-popup v-for="(feature, index) in features"  :key="index" :properties="feature.properties" :color="color" :lang="lang"></formater-popup>
    </div>
    <div class="fmt-container">
      <div id="fmtMap" />
    </div>
   
  </div>
</template>
<script>
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
    }
  },
  data () {
    return {
      map: null,
      layers: null,
      features: []
    }
  },
  created () {
    console.log(this.lang)
  },
  mounted () {
    console.log(this.lang)
    this.initialize()
  },
  methods: {
    initialize () {
      console.log('initialize')
      console.log(this.$shadeColor(this.color, -0.4))
      this.map = L.map( "fmtMap", {scrollWheelZoom: false}).setView([20, -0.09], 3);

      // this.map.on( "zoom", function(e){ this.updateAllPolygons();})
      L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
          maxZoom: 18,
          minZoom:2
         }).addTo( this.map )
      if (this.geojson) {
        this.$http.get(this.geojson).then(
          response => { this.addGeojsonLayer(response.body)}
        )
      }
    },
    addGeojsonLayer (features) {
      this.features = features.features
      var _this = this
      this.layers = L.geoJSON(features, {
         style: function (feature) {
           return {color: _this.color, width: 1}
         },
         onEachFeature: function (feature, layer) {
           layer.on('click', function (layer) {
             if (!feature.properties.first) {
	             var node = document.querySelector('#popup_' + feature.properties.id)
	             this.bindPopup(node)
	             this.openPopup()
                 feature.properties.first = true
             }
           })
            var node = document.querySelector('#popup_' + feature.properties.id)
             console.log(node)
//            var content = '<h3 style="color:'+ feature.properties.style.color +';">' + feature.properties.name + '</h3>'
//            content += '<p>' + feature.properties.description + '</p>'
//            content += '<a href="' + feature.properties.link + '">' + seePage + '</a>'
//            layer.bindPopup(node.cloneNode(true))
         }
       }).on('add', function () {
         _this.map.fitBounds(_this.layers.getBounds(), {padding: [50, 50]})
         var next = function () { _this.layers.getLayers()[2].fire('click')}
         setTimeout(next, 1000)
       })
      
        this.layers.addTo(this.map)
          // this.layer.getLayers()[0].fire('click')
     
    }
  }
}
</script>
<style>
div.fmt-wrapper{
  width: 100%;
  text-align:center;
}
div.fmt-container{
   position:relative;
   max-width:1200px;
   height:500px;
   margin: auto;
}
div[id="fmtMap"] {
  position:absolute;
  min-height: 500px;
  width:100%;
  z-index:0;
}
.area-button a{
  color:white;
  margin: 0 30px;
  text-decoration: none;
}

.area-button a:hover,
.area-button a:visited {
  color: white;
}
.area-button div{
  min-width:120px;
  color: white;
  vertical-align:middle;
 
  font-weight:600;
  display: inline-block;
  box-shadow: 1px 1px 5px 2px rgba(0, 0, 0, 0.7);
}
.area-button a div{
  min-height: 50px;
  padding-top:30px;
   opacity:0.8;
}
.area-button div.disabled{
   background-color: #ccc;
   padding-top: 20px;
   min-height:60px;
}
.area-button a div:hover {
  opacity:1
}
</style>