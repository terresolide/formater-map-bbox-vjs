require("exports-loader?!./l.min.js")

import Vue from 'vue'

import VueResource from 'vue-resource'
Vue.use(VueResource);

import vueCustomElement from 'vue-custom-element'
Vue.use(vueCustomElement);
// import ajax from './services/ajax'


//pour la traduction 
import VueI18n from 'vue-i18n'
Vue.use(VueI18n);

import FormaterMap from './formater-map.vue'


ljs.addAliases({
    dep: [
       // font-awesome
       // 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', 
       // leaflet
       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css'
      ]
})
ljs.load('dep', function() {
  // Vue.customElement('formater-catalogue', FormaterCatalogue) 
//  const i18n = new VueI18n({
//    fallbackLocale: 'en'
//  })
//  new Vue({
//    el: '#formaterMap',
//    i18n: i18n,
//    template: '<FormaterMap/>',
//    components: { FormaterMap }
//  })
  Vue.customElement('formater-map', FormaterMap) 

})

