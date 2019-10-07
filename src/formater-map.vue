<template>
  <div class="fmt-wrapper">
    <div class="fmt-container">
      <div id="fmtMap" />
    </div>
  </div>
</template>
<script>
var L = require('leaflet');

export default {
  name: 'FormaterMap',
  components: {},
  props: {
    data: {
      type: Object,
      default: null
    },
    geojson: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      map: null,
      layer: null
    }
  },
  mounted () {
    this.initialize()
  },
  methods: {
    initialize () {
      console.log('initialize')
      this.map = L.map( "fmtMap").setView([20, -0.09], 3);

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
       this.layer = L.geoJSON(features, {
         style: function (feature) {
           return feature.properties.style
         },
         onEachFeature: function (feature, layer) {
           var content = '<h3>' + feature.properties.name + '</h3>'
           content += '<p>' + feature.properties.description + '</p>'
           content += '<a href="' + feature.properties.link + '">Voir la page</a>'
           layer.bindPopup(content)
         }
       })
       this.layer.addTo(this.map)
       this.map.fitBounds(this.layer.getBounds(), {padding: [10, 10]})
     
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
   max-width:900px;
   margin: auto;
}
div[id="fmtMap"] {
  position:absolute;
  min-height: 500px;
  width:100%;
  z-index:0;
}
</style>