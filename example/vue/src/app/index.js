import style from './style.less';
import withRender from './page.vue.tpl';

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
    }
  }
});
