<template>
<div class="fmt-popup" :id="'popup_' + properties.id">
	     <h3 :style="{color: $shadeColor(color, -0.3)}">{{properties.name.toUpperCase()}}</h3>
	     <div style="text-align:justify;">
	     <img v-if="properties.image" :src="properties.image.src" :title="properties.image.title" />
	     <span v-html="properties.description" style="text-align:justify;"></span>
	     </div>
	     <div style="clear:left;text-align:right;" >
	     <a v-if="properties.link" :href="properties.link">{{seePage}}</a></div>
	    </div>
</template>
<script>
export default {
  name: 'FormaterPopup',
  props: {
    lang: {
      type: String,
      default: 'en'
    },
    properties: {
      type: Object,
      default: null
    },
    color: {
      type: String,
      default: null
    }
  },
  computed: {
    seePage () {
      if (this.lang === 'fr') {
        return 'Voir la page des données'
      } else {
        return 'See the data page'
      }
    }
  }
}
</script>
<style>
.fmt-popup h3{
  margin: 8px 0;
}
.fmt-popup{
  display:none;
  max-width: 300px;
  text-align: left;
  line-height:1;
  font-size: 0.9rem;
}
.leaflet-popup-content .fmt-popup{
  display: block;
}
.fmt-popup img{
  float: left;
  max-width:150px;
  max-height:150px;
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>