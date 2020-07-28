$(function() {
  var app = new Vue({
    el: '#main',
    data: {
      leftBar: false,
      nav: [
        { id: 1, name: '菜谱', icon: 'el-icon-food' },
        { id: 2, name: '厨师', icon: 'el-icon-user' },
        { id: 3, name: '厨具', icon: 'el-icon-knife-fork' },
        { id: 4, name: '装修', icon: 'el-icon-refrigerator' },
        { id: 5, name: '采集', icon: 'el-icon-chicken' },
        { id: 6, name: '任务', icon: 'el-icon-document' },
        { id: 7, name: '计算器', icon: 'el-icon-set-up' },
        { id: 8, name: '个人', icon: 'el-icon-user' },
        { id: 9, name: '说明', icon: 'el-icon-info' },
      ],
      navId: 1,
      data: [],
      recipes: [],
      recipes_page: [],
      recipesCurPage: 1,
      recipesPageSize: 20,
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        $.ajax({
          url: './data/data.min.json'
        }).then(rst => {
          console.log(rst);
          this.data = rst;
          this.initData();
        });
      },
      checkNav(id) {
        this.navId = id;
        this.leftBar = false;
      },
      initData() {
        this.recipes = this.data.recipes.map(item => {
          item.rarity_show = '★★★★★'.slice(0, item.rarity);
          const skill_arr = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam'];
          for (let i of skill_arr) {
            item[i] = item[i] || null;
          }
          return item;
        });
        this.recipes_page = this.recipes.slice(0, this.recipesPageSize);
      },
      handleCurrentChange(val) {
        if (this.navId === 1) {
          this.recipesCurPage = val;
          const size = this.recipesPageSize;
          this.recipes_page = this.recipes.slice((val - 1) * size, val * size);
        }
      }
    },
    watch: {}
  });
});