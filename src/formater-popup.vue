<template>
<div class="fmt-popup" :class="'popup_' + properties.index">
	     <h3 :style="{color: $shadeColor(color, -0.3)}">{{properties.name.toUpperCase()}}</h3>
	     <div style="text-align:justify;">
	      <img v-if="properties.image" :src="imageUrl(properties.image.src)" :style="{width: properties.width + 'px'}"
	       :title="properties.image.attribution" :alt="'[' + properties.image.attribution + ']'"/>
	     <span v-html="properties.description" style="text-align:justify;"></span>
	     </div>
	     <div style="clear:left;text-align:right;margin-top:5px;" >
	     <a v-if="properties.link" :href="properties.link" target="_blank">{{seePage}}</a>
	     <em v-if="!properties.link" style="color:blue;" v-html="lang === 'en' ? 'On Going': '&Agrave; venir'"></em>
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
  methods: {
    isAbsoluteUrl(string) {
      var res = string.match(/^(http(s)?:\/\/.).*$/g);
      return (res !== null)
    },
    imageUrl (url) {
      if (this.isAbsoluteUrl(url)) {
        return url
      } else {
        var location = new URL(window.location.href)
        var pathname = location.pathname.match(/(.*)(\/[^/]*\.php)$/i)
        var path = pathname && pathname.length > 2 ? pathname[1] : location.pathname
        return location.protocol + '//' + location.hostname +  (location.port ? ':' + location.port : '') + path + url
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
  max-width: 400px;
  text-align: left;
  line-height:1;
  font-size: 0.9rem;
}
.leaflet-popup-content .fmt-popup{
  display: block;
}
.fmt-popup img{
  float: left;
  margin-right: 5px;
  margin-bottom: 0px;
}
</style>