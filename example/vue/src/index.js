import Vue from 'vue';
import app from './app';

const vm = new Vue({
  el: '#app',
  data() {
    return {
      message: 'hello',
    };
  },
  ...app,
});
