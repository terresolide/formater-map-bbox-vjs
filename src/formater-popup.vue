<template>
<div class="fmt-popup" :id="'popup_' + properties.id">
	     <h3 :style="{color: $shadeColor(properties.style.color, -0.3)}">{{properties.name}}</h3>
	     <img v-if="properties.image" :src="properties.image.src" :title="properties.image.title" />
	     <span v-html="properties.description"></span>
	     <div style="clear:left;"><a :href="properties.link">{{seePage}}</a></div>
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
    }
  },
  computed: {
    seePage () {
      if (this.lang === 'fr') {
        return 'Voir la page'
      } else {
        return 'See the page'
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