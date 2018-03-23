import withRender from './page.vue.tpl?scoped&style=./style.less';

export default withRender({
  data() {
    return {
      appMessage: 'Hello APP',
      count: 1,
    };
  },
  methods: {
    click() {
      this.count++;
    },
  },
});
