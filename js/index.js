$(function() {
  var app = new Vue({
    el: '#main',
    data: {
      leftBar: false,
      rightBar: false,
      hideSuspend: false,
      settingVisible: false,
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
      tableHeight: window.innerHeight - 122,
      data: [],
      recipes: [],
      recipesPage: [],
      repCol: {
        rarity: false,
        skills: false,
        price: true,
        time: true,
        gold_eff: true,
        origin: true,
      },
      repKeyword: '',
      recipesCurPage: 1,
      recipesPageSize: 20,
      questsType: 1,
      questsTypes: [{
        value: 1,
        label: '主线任务'
      }, {
        value: 2,
        label: '支线任务'
      }],
      questsKeyword: '',
      questsMain: [],
      questsPage: [],
      questsRegional: [],
      questsCurPage: 1,
      questsPageSize: 20,
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
          this.initRep();
        });
      },
      checkNav(id) {
        this.navId = id;
        this.leftBar = false;
      },
      initRep() {
        this.recipes = [];
        for (const item of this.data.recipes) {
          item.rarity_show = '★★★★★'.slice(0, item.rarity);
          const skill_arr = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam'];
          for (let i of skill_arr) {
            item[i] = item[i] || null;
          }
          item.materials_show = item.materials.map(m => {
            const name = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).name;
            return `${name}*${m.quantity}`;
          }).join(' ');
          const materials_search = item.materials.map(m => {
            const name = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).name;
            return name;
          }).join(' ');
          item.origin = item.origin.replace('<br>', '\n');
          item.time_show = (item.time >= 60 ? `${~~(item.time / 60)}分` : '') + (item.time % 60 !== 0 ? `${item.time % 60}秒` : '');
          item.gold_eff = Math.round(3600 / item.time * item.price);
          const s_name = item.name.indexOf(this.repKeyword) > -1;
          const s_origin = item.origin.indexOf(this.repKeyword) > -1;
          const s_material = materials_search.indexOf(this.repKeyword) > -1;
          if (s_name || s_origin || s_material) {
            this.recipes.push(item);
          }
        }
        this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
      },
      handleCurrentChange(val) {
        if (this.navId === 1) {
          this.recipesCurPage = val;
          const size = this.recipesPageSize;
          this.recipesPage = this.recipes.slice((val - 1) * size, val * size);
        } else if (this.navId === 6) {
          this.questsCurPage = val;
          const size = this.questsPageSize;
          const quests = this.questsType === 1 ? this.questsMain : this.questsRegional;
          this.questsPage = quests.slice((val - 1) * size, val * size);
          this.$refs.questsTable.bodyWrapper.scrollTop = 0;
        }
      },
      handleRepSort(sort) {
        const map = {
          time_show: 'time',
          rarity_show: 'rarity'
        };
        if (!sort.order) {
          this.initRep();
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.recipesCurPage = 1;
        this.recipes.sort(this.customSort(sort));
        this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
      },
      handleQuestsSort(sort) {
        if (!sort.order) {
          this.initQuests();
        }
        this.questsCurPage = 1;
        if (this.questsType === 1) {
          this.questsMain.sort(this.customSort(sort));
          this.questsPage = this.questsMain.slice(0, this.questsPageSize);
        } else {
          this.questsRegional.sort(this.customSort(sort));
          this.questsPage = this.questsRegional.slice(0, this.questsPageSize);
        }
      },
      customSort(sort) {
        const map = {
          ascending: -1,
          descending: 1,
        }
        function sortFunc(x, y) {
          if (x[sort.prop] < y[sort.prop]) {
            return map[sort.order];
          } else if (x[sort.prop] > y[sort.prop]) {
            return 0 - map[sort.order];
          } else {
            return 0;
          }
        }
        return sortFunc;
      },
      initQuests() {
        const key = this.questsKeyword;
        this.questsCurPage = 1;
        this.questsMain = [];
        this.questsRegional = [];
        for (let item of this.data.quests) {
          const rewards = item.rewards.map(r => {
            return r.quantity ? `${r.name} * ${r.quantity}` : r.name;
          });
          item.rewards_show = rewards.join('\n');
          const search = String(item.questId).indexOf(key) > -1 || item.goal.indexOf(key) > -1 || item.rewards_show.indexOf(key) > -1;
          if (item.type === '主线任务' && search) {
            this.questsMain.push(item);
          } else if (item.type === '支线任务' && search) {
            this.questsRegional.push(item);
          }
        }
        this.questsPage = this.questsType == 1 ? this.questsMain.slice(0, this.questsPageSize) : this.questsRegional.slice(0, this.questsPageSize);
        this.$nextTick(() => {
          this.$refs.questsTable.bodyWrapper.scrollTop = 0;
          this.$refs.questsTable.clearSort();
        });
      },
      reset() {
        //
      }
    },
    watch: {
      repKeyword() {
        this.initRep();
      },
      questsType() {
        this.initQuests();
      },
      questsKeyword() {
        this.initQuests();
      },
      navId(val) {
        console.log(val);
        if (val === 1) {
          this.initRep();
          this.$nextTick(()=>{
            this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
            this.$refs.recipesTable.bodyWrapper.scrollLeft = 0;
            this.$refs.recipesTable.doLayout();
          });
        } else if (val === 6) {
          this.initQuests();
        }
      }
    }
  });
});