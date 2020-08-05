<template>
<div class="fmt-popup" :class="'popup_' + properties.index">
	     <h3 :style="{color: $shadeColor(color, -0.3)}">{{properties.name.toUpperCase()}}</h3>
	     <div style="text-align:justify;">
	     <a v-if="properties.image && properties.image.page" target="_blank"
	     :href="properties.image.page" :title="properties.image.attribution">
	       <img  :src="properties.image.src" />
	     </a>
	      <img v-if="properties.image && !properties.image.page" :src="properties.image.src" />
	     <span v-html="properties.description" style="text-align:justify;"></span>
	     </div>
	     <div style="clear:left;text-align:right;margin-top:5px;" >
	     <a v-if="properties.link" :href="properties.link" target="_blank">{{seePage}}</a>
	     <em v-if="!properties.link" style="color:blue;">{{lang === 'en' ? 'On Going': 'A venir'}}</em>
	     </div>
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
  },
  created () {
    console.log(this.index)
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