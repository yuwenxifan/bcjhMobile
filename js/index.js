$(function() {
  Vue.component('muti-select', {
    template: `
    <div id="muti-select" ref="mutiSelect">
      <div class="input-box" @click="show = !show">
        <span class="placeholder" v-show="valueId.length == 0">{{placeholder || '请选择'}}</span>
        <span class="tag" v-show="names.length > 0 && !max">{{names[0]}}</span>
        <span class="tag" v-show="names.length > 1 && !max">+{{names.length - 1}}</span>
        <span class="tag" :class="max == 1 ? 'only' : ''" v-if="max" v-for="name in names">{{name}}</span>
        <i class="el-input__icon el-icon-arrow-up" :class="show ? 'active' : ''"></i>
      </div>
      <div class="arrow" v-show="show"></div>
      <div class="dropdown-box" v-show="show">
        <div class="controll-box">
          <i class="el-input__icon el-icon-error clear" @click="clearKeyword"></i>
          <input v-model="keyword" placeholder="查找" @focus="handlerFocus"/>
          <span class="btn" @click="clear" v-if="canEmpty">清空</span>
        </div>
        <ul class="dropdown-list">
          <li
            v-for="item in f_option"
            @click="checkOption(item.id, item.name)"
            :class="(valueId.indexOf(item.id) > -1 ? 'active' : disableClass(item.id)) + ' ' + (item.isf ? 'red' : '')"
          >
            <span>{{item.name}}</span>
            <span class="sub-name" v-if="item.subName">{{item.subName}}</span>
          </li>
        </ul>
        <p class="empty" v-show="f_option.length == 0">无匹配数据</p>
      </div>
    <div>
    `,
    props: ['option', 'placeholder', 'value', 'max', 'empty', 'disable'],
    data: function() {
      return {
        valueId: [],
        names: [],
        keyword: '',
        show: false,
        f_option: [],
        fold: true
      };
    },
    computed: {
      canEmpty() {
        if (this.empty != null) {
          return this.empty;
        }
        return true;
      },
    },
    mounted() {
      this.initOption();
    },
    methods: {
      initOption() {
        const valueId = [];
        const names = [];
        if (this.value && this.value.id && this.value.id.length > 0) {
          this.value.id.forEach(id => {
            const row = this.option.find(item => {
              return item.id == id;
            });
            if (row) {
              valueId.push(id);
              names.push(row.name);
            }
          });
          this.valueId = valueId;
          this.names = names;
        }
        this.f_option = this.option.filter(item => {
          return item.name.indexOf(this.keyword) > -1;
        });
      },
      checkOption(val, name) {
        const index = this.valueId.indexOf(val);
        if(index > -1 && this.canEmpty) {
          this.valueId.splice(index, 1);
          this.names.splice(index, 1);
        } else {
          if (this.disable && this.disable.indexOf(val) > -1) { // 禁用了
            return;
          }
          if (this.max && this.valueId.length == this.max) { // 如果有选择个数限制，且已经达到了
            const values = this.valueId.slice(1);
            const names = this.names.slice(1);
            values.push(val);
            names.push(name);
            this.valueId = values;
            this.names = names;
          } else {
            this.valueId.push(val);
            this.names.push(name);
          }
          if (this.max == 1) {
            this.show = false;
          }
        }
      },
      clear() {
        this.valueId = [];
        this.names = [];
      },
      disableClass(id) {
        if (!this.disable || this.disable.length == 0 || this.disable.indexOf(id) < 0) {
          return '';
        }
        return 'disable';
      },
      clickOther(e) {
        if (!this.$refs.mutiSelect.contains(e.target) && this.fold) {
          this.show = false;
        }
      },
      handlerFocus() {
        const that = this;
        window.removeEventListener('click', this.clickOther);
        this.$emit('focus');
        setTimeout(() => {
          window.addEventListener("click", that.clickOther);
        }, 200);
      },
      clearKeyword() {
        this.keyword = '';
      },
      unfold() {
        this.fold = false;
        this.show = true;
        setTimeout(() => {
          this.fold = true;
        }, 50);
      }
    },
    watch: {
      option: {
        deep: true,
        handler(val) {
          this.initOption();
        }
      },
      valueId: {
        deep: true,
        handler(val) {
          const row = val.map(id => {
            return this.option.find(item => {
              return item.id === id;
            });
          });
          this.$emit('input', {
            id: val,
            row
          });
          this.$emit('change', row);
        }
      },
      keyword(val) {
        this.f_option = this.option.filter(item => {
          return item.name.indexOf(val) > -1 || (item.subName && item.subName.indexOf(val) > -1);
        });
      },
      show(val) {
        if (val) {
          this.keyword = "";
          window.addEventListener("click", this.clickOther);
        } else {
          window.removeEventListener('click', this.clickOther);
        }
      }
    }
  });
  var app = new Vue({
    el: '#main',
    data: {
      count: 0,
      leftBar: false,
      rightBar: false,
      hideSuspend: false,
      settingVisible: false,
      loading: true,
      tabBox: false,
      reg: new RegExp( '<br>' , "g" ),
      skill_map: {
        stirfry: '炒',
        boil: '煮',
        knife: '切',
        fry: '炸',
        bake: '烤',
        steam: '蒸'
      },
      skill_buff: {
        1: 0,
        2: 10,
        3: 30,
        4: 50,
      },
      userData: null,
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
      navId: 7,
      calCode: 'cal',
      tableHeight: window.innerHeight - 122,
      boxHeight: window.innerHeight - 50,
      chartHeight: window.innerHeight - 390,
      chartWidth: window.innerWidth,
      data: [],
      materials_list: [],
      chefs_list: [],
      partial_skill_list: [],
      self_skill_list: [],
      reps_list: [],
      userDataText: '',
      userUltimateChange: false,
      userUltimate: {
        decoBuff: '',
        Stirfry: '',
        Boil: '',
        Knife: '',
        Fry: '',
        Bake: '',
        Steam: '',
        Male: '',
        Female: '',
        All: '',
        Partial: { id: [], row: [] },
        Self: { id: [], row: [] },
        MaxLimit_1: '',
        MaxLimit_2: '',
        MaxLimit_3: '',
        MaxLimit_4: '',
        MaxLimit_5: '',
        PriceBuff_1: '',
        PriceBuff_2: '',
        PriceBuff_3: '',
        PriceBuff_4: '',
        PriceBuff_5: '',
      },
      allUltimate: {
      },
      sort: {
        rep: {},
        chef: {},
        equip: {},
        decoration: {
          prop: 'effAvg',
          order: 'descending'
        }
      },
      recipes: [],
      recipesPage: [],
      repCol: {
        id: false,
        img: false,
        rarity: false,
        skills: false,
        materials: false,
        price: true,
        exPrice: false,
        time: true,
        limit: false,
        total_price: false,
        total_time_show: false,
        gold_eff: true,
        material_eff: false,
        origin: true,
        unlock: false,
        combo: false,
        guests: false,
        degree_guests: false,
        gift: false,
      },
      repColName: {
        id: '编号',
        img: '图',
        rarity: '星级',
        skills: '技法',
        materials: '材料',
        price: '单价',
        exPrice: '熟练加价',
        time: '单时间',
        limit: '一组',
        total_price: '总价',
        total_time_show: '总时间',
        gold_eff: '金币效率',
        material_eff: '总耗材效率',
        origin: '来源',
        unlock: '解锁',
        combo: '合成',
        guests: '贵客',
        degree_guests: '升阶贵客',
        gift: '神级符文',
      },
      repFilter: {
        rarity: {
          1: true,
          2: true,
          3: true,
          4: true,
          5: true
        },
        skill: {
          stirfry: { name: '炒', flag: true },
          boil: { name: '煮', flag: true },
          knife: { name: '切', flag: true },
          fry: { name: '炸', flag: true },
          bake: { name: '烤', flag: true },
          steam: { name: '蒸', flag: true },
        },
        material: {
          vegetable: { name: '菜', flag: true },
          meat: { name: '肉', flag: true },
          creation: { name: '面', flag: true },
          fish: { name: '鱼', flag: true },
        },
        material_type: false,
        guest: false,
        combo: false,
        price: '',
        materialEff: {},
      },
      repChef: { id: [], row: [] },
      chefRep: { id: [], row: [] },
      originRepFilter: {},
      material_type: [
        {
          origin: ['菜棚', '菜地', '森林'],
          type: 'vegetable'
        },
        {
          origin: ['鸡舍', '猪圈', '牧场'],
          type: 'meat'
        },
        {
          origin: ['作坊'],
          type: 'creation'
        },
        {
          origin: ['池塘'],
          type: 'fish'
        },
      ],
      skill_radio: false,
      skill_type: false,
      repKeyword: '',
      guestKeyword: '',
      repSkillGap: false,
      recipesCurPage: 1,
      recipesPageSize: 20,
      chefs: [],
      chefsPage: [],
      chefCol: {
        id: false,
        img: false,
        rarity: false,
        skills: true,
        skill: true,
        gather: false,
        sex: false,
        origin: true,
        ultimateGoal: false,
        ultimateSkill: false
      },
      chefColName: {
        id: '编号',
        img: '图',
        rarity: '星',
        skills: '技法',
        skill: '技能',
        gather: '采集',
        sex: '性别',
        origin: '来源',
        ultimateGoal: '修炼任务',
        ultimateSkill: '修炼技能'
      },
      chefFilter: {
        chefKeyword: '',
        rarity: {
          1: true,
          2: true,
          3: true,
          4: true,
          5: true
        },
        skills: {
          stirfry: { name: '炒', val: '' },
          boil: { name: '煮', val: '' },
          knife: { name: '切', val: '' },
          fry: { name: '炸', val: '' },
          bake: { name: '烤', val: '' },
          steam: { name: '蒸', val: '' },
        },
        sex: {
          male: { name: '男', flag: true },
          female: { name: '女', flag: true },
          other: { name: '未知', flag: true }
        },
      },
      partial_skill: { id: [], row: [] },
      chefSkillGap: false,
      chefUltimate: true,
      chefUseAllUltimate: false,
      showLastSkill: true,
      originChefFilter: {},
      chefsCurPage: 1,
      chefsPageSize: 20,
      equips: [],
      equipsPage: [],
      equipCol: {
        id: false,
        img: false,
        rarity: true,
        skill: true,
        origin: true
      },
      equipColName: {
        id: '编号',
        img: '图',
        rarity: '星',
        skill: '技能',
        origin: '来源'
      },
      equipFilter: {
        equipKeyword: '',
        rarity: {
          1: true,
          2: true,
          3: true
        },
        skillType: {
          UseStirfry: { name: '炒售价', flag: true },
          UseBoil: { name: '煮售价', flag: true },
          UseKnife: { name: '切售价', flag: true },
          UseFry: { name: '炸售价', flag: true },
          UseBake: { name: '烤售价', flag: true },
          UseSteam: { name: '蒸售价', flag: true },
          Stirfry: { name: '炒技法', flag: true },
          Boil: { name: '煮技法', flag: true },
          Knife: { name: '切技法', flag: true },
          Fry: { name: '炸技法', flag: true },
          Bake: { name: '烤技法', flag: true },
          Steam: { name: '蒸技法', flag: true },
          UseMeat: { name: '肉售价', flag: true },
          UseCreation: { name: '面售价', flag: true },
          UseVegetable: { name: '菜售价', flag: true },
          UseFish: { name: '鱼售价', flag: true },
          Meat: { name: '肉采集', flag: true },
          Creation: { name: '面采集', flag: true },
          Vegetable: { name: '菜采集', flag: true },
          Fish: { name: '鱼采集', flag: true },
          Gold_Gain: { name: '金币获得', flag: true },
          GuestApearRate: { name: '稀有客人', flag: true },
          OpenTime: { name: '开业时间', flag: true },
          Material_Gain: { name: '素材获得', flag: true },
          AllSkill: { name: '全技法', flag: true },
          AllMap: { name: '全采集', flag: true },
          // 防止以后出一个技法加其他所有技法减的厨具被认定为全技法，全技法/全采集用技能描述去匹配
        },
        buff: false
      },
      equip_concurrent: false,
      equip_radio: false,
      originEquipFilter: {},
      equipsCurPage: 1,
      equipsPageSize: 20,
      decorations: [],
      decorationsPage: [],
      decorationCol: {
        checkbox: true,
        id: false,
        img: false,
        gold: true,
        tipMin: false,
        tipMax: false,
        tipTime: false,
        effMin: false,
        effMax: false,
        effAvg: true,
        position: false,
        suit: true,
        suitGold: true,
        origin: true,
      },
      decorationColName: {
        checkbox: "选择",
        id: "编号",
        img: '图',
        gold: "收入加成",
        tipMin: "最小玉璧",
        tipMax: "最大玉璧",
        tipTime: "冷却时间",
        effMin: "最小玉璧/天",
        effMax: "最大玉璧/天",
        effAvg: "平均玉璧/天",
        position: "位置",
        suit: "套装",
        suitGold: "套装加成",
        origin: "来源",
      },
      decorationFilter: {
        keyword: '',
        position: [
          { name: '1大桌', flag: true },
          { name: '1小桌', flag: true },
          { name: '1门', flag: true },
          { name: '1灯', flag: true },
          { name: '1窗', flag: true },
          { name: '2大桌', flag: true },
          { name: '2小桌', flag: true },
          { name: '2门', flag: true },
          { name: '2窗', flag: true },
          { name: '3灯', flag: true },
          { name: '3大桌', flag: true },
          { name: '3小桌', flag: true },
          { name: '1装饰', flag: true },
          { name: '2装饰', flag: true },
          { name: '2屏风', flag: true },
          { name: '3包间', flag: true },
        ]
      },
      decoration_radio: false,
      originEquipFilter: {},
      decorationsCurPage: 1,
      decorationsPageSize: 20,
      decoSelect: [],
      decoSelectId: [],
      decoBuff: '',
      suits: [],
      mapTypes: [],
      mapType: '牧场',
      maps: [],
      mapsPage: [],
      mapLabel: [],
      mapCol: {
        0: false,
        1: false,
        2: false,
        3: true,
        4: true,
      },
      mapFilter: {
        season: false,
        cnt: '',
        skill: ''
      },
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
      calType: { id: [], row: [] },
      rules: [],
      decoBuffValue: "",
      buffTips: '当前使用菜谱售价修炼加成：无，当前装饰加成：0%',
      calChef: {
        1: { id: [], row: [] },
        2: { id: [], row: [] },
        3: { id: [], row: [] }
      },
      calEquip: {
        1: { id: [], row: [] },
        2: { id: [], row: [] },
        3: { id: [], row: [] }
      },
      calRep: {
        '1-1': { id: [], row: [] },
        '1-2': { id: [], row: [] },
        '1-3': { id: [], row: [] },
        '2-1': { id: [], row: [] },
        '2-2': { id: [], row: [] },
        '2-3': { id: [], row: [] },
        '3-1': { id: [], row: [] },
        '3-2': { id: [], row: [] },
        '3-3': { id: [], row: [] },
      },
      calRepCnt: {
        '1-1': 0,
        '1-2': 0,
        '1-3': 0,
        '2-1': 0,
        '2-2': 0,
        '2-3': 0,
        '3-1': 0,
        '3-2': 0,
        '3-3': 0,
      },
      calFocus: null,
      calChefs_list: [],
      calEquips_list: [],
      calReps_list: {
        1: [],
        2: [],
        3: []
      },
      calRep_list: [],
      isOriginHei: true,
      screenHeight:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,
      originHeight:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,
    },
    computed: {
      skillWidth() {
        return (this.showLastSkill || !this.chefUltimate) ? 48 : 68;
      },
      tips() {
        const names = this.partial_skill.row.map(row => row.name);
        return `${names.join(' ')} 上场技能开`;
      },
      calChefShow() {
        const rst = {};
        for (const key in this.calChef) {
          rst[key] = this.calChef[key].row[0] ? this.showChef(this.calChef[key].row[0], key) : {};
        }
        return rst;
      },
      ulti() {
        const userUltimate = {};
        for (const key in this.userUltimate) {
          if (typeof this.userUltimate[key] == 'string') {
            userUltimate[key] = Number(this.userUltimate[key]);
          } else {
            userUltimate[key] = JSON.parse(JSON.stringify(this.userUltimate[key]));
          }
        }
        return userUltimate;
      },
      disable() {
        let rst = [];
        for (let i = 1; i < 4; i++) {
          if (this.calChef[i].id.length > 0) {
            rst.push(this.calChef[i].id[0]);
          }
        }
        return rst;
      },
      disableRep() {
        let rst = [];
        for (let key in this.calRep) {
          if (this.calRep[key].id.length > 0) {
            rst.push(this.calRep[key].id[0]);
          }
        }
        return rst;
      }
    },
    mounted() {
      this.loadData();
      this.getUserData();
      const arr = ['Rep', 'Chef', 'Equip', 'Decoration'];
      for (const key of arr) {
        this[`origin${key}Filter`] = JSON.parse(JSON.stringify(this[`${key.toLowerCase()}Filter`]));
      }
      const that = this;
      window.onresize = function() {
        return (function() {
          that.screenHeight =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        })();
      };
    },
    methods: {
      loadData() {
        $.ajax({
          url: './data/data.min.json'
        }).then(rst => {
          this.data = rst;
          this.initData();
        });
      },
      checkNav(id) {
        this.navId = id;
        this.leftBar = false;
      },
      nameMinWidth(name) {
        const len = name.length;
        return len * 15 + 30;
      },
      initData() {
        const s = Math.pow(10, 5);
        const combo_recipes = this.data.recipes.slice(-8);
        this.data.recipes = this.data.recipes.map(item => {
          item.rarity_show = '★★★★★'.slice(0, item.rarity);
          const skill_arr = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam'];
          for (let i of skill_arr) {
            item[i] = item[i] || null;
          }
          let materials_cnt = 0;
          item.materials_show = item.materials.map(m => {
            const name = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).name;
            materials_cnt += m.quantity;
            return `${name}*${m.quantity}`;
          }).join(' ');
          item.materials_search = item.materials.map(m => {
            const name = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).name;
            return name;
          }).join(' ');
          item.materials_type = item.materials.map(m => {
            const origin = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).origin;
            const m_type = this.material_type.find(t => {
              return t.origin.indexOf(origin) > -1;
            }).type;
            return m_type;
          });
          item.materials_type = Array.from(new Set(item.materials_type));
          item.origin = item.origin.replace(this.reg, '\n');
          item.time_show = this.formatTime(item.time);
          item.gold_eff = Math.round(3600 / item.time * item.price);
          item.total_price = item.price * item.limit;
          item.total_time = item.time * item.limit;
          item.total_time_show = this.formatTime(item.total_time);
          item.material_eff = ~~(3600 / item.time * materials_cnt);
          item.combo = [];
          for (const i of this.data.combos) {
            if (i.recipes.indexOf(item.recipeId) > -1) {
              const combo = combo_recipes.find(r => {
                return r.recipeId === i.recipeId;
              });
              item.combo.push(combo.name);
            }
          }
          item.combo = item.combo.join('\n');
          item.degree_guests = item.guests.map((g, i) => {
            return `${'优特神'.slice(i, i + 1)}-${g.guest}`;
          }).join('\n');
          const guests = [];
          for (const g of this.data.guests) {
            const rep = g.gifts.map(r => r.recipe);
            const index = rep.indexOf(item.name);
            if (index > -1) {
              guests.push(`${g.name}-${g.gifts[index].antique}`);
            }
          }
          item.normal_guests = guests.join('\n');
          const skills = {};
          skill_arr.forEach(key => {
            if (item[key]) {
              skills[key] = item[key];
            }
          });
          item.skills = skills;
          return item;
        });
        this.initRep();
        this.data.chefs = this.data.chefs.map(item => {
          item.rarity_show = '★★★★★'.slice(0, item.rarity);
          const skill_arr = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam', 'meat', 'veg', 'fish', 'creation'];
          for (let i of skill_arr) {
            item[i] = item[i] || null;
          }
          const skill = this.data.skills.find(s => {
            return s.skillId === item.skill;
          });
          item.skill = skill.desc;
          item.skill_obj = skill;
          item.sex = item.tags ? (item.tags[0] == 1 ? '男' : '女') : '';
          item.origin = item.origin.replace(this.reg, '\n');
          item.ultimateGoal = item.ultimateGoal.join('\n');
          const ultimateSkill = this.data.skills.find(s => {
            return s.skillId === item.ultimateSkill;
          });
          item.ultimateSkillShow = ultimateSkill ? ultimateSkill.desc : '';
          item.ultimateSkill = ultimateSkill;
          item.ultimateSkillCondition = ultimateSkill ? ultimateSkill.effect[0].condition : '';
          return item;
        });
        this.data.equips = this.data.equips.map(item => {
          item.rarity_show = '★★★'.slice(0, item.rarity);
          const skill = this.data.skills.filter(s => {
            return item.skill.indexOf(s.skillId) > -1;
          });
          let effect = [];
          skill.forEach(s => {
            effect = effect.concat(s.effect);
          })
          item.effect = effect;
          item.skill = skill.map(s => s.desc).join('\n').replace(this.reg, '\n');
          let skillType = {};
          for (const s of skill) {
            for (const i of s.effect) {
              if (i.type == 'OpenTime') {
                skillType[i.type] = i.value < 0 ? 'buff' : 'debuff';
              } else {
                skillType[i.type] = i.value > 0 ? 'buff' : 'debuff';
              }
            }
          }
          item.skill_type = skillType;
          item.origin = item.origin.replace(this.reg, '\n');
          return item;
        });
        let suits = [];
        this.data.decorations = this.data.decorations.map(item => {
          item.gold_show = item.gold ? `${Math.round(item.gold * s * 100) / s}%` : null;
          item.tipMin = item.tipMin || '';
          item.tipMax = item.tipMax || '';
          const dSecond = 86400;
          const day = item.tipTime > dSecond ? `${Math.floor(item.tipTime / dSecond)}天` : '';
          const hour = (item.tipTime % dSecond) ? `${Math.floor(item.tipTime % dSecond / 3600)}小时` : '';
          item.tipTime_show = day + hour;
          item.effMin = item.tipMin ? parseFloat((item.tipMin / (item.tipTime / dSecond)).toFixed(1)) : null;
          item.effMax = item.tipMax ? parseFloat((item.tipMax / (item.tipTime / dSecond)).toFixed(1)) : null;
          item.effAvg = Math.floor(((item.effMin + item.effMax) * 10 / 2)) / 10 || null;
          item.suitGold_show = item.suitGold ? `${Math.round(item.suitGold * s * 100) / s}%` : null;
          if (item.suit) {
            suits.push(item.suit);
          }
          return item;
        });
        this.suits = Array.from(new Set(suits));
        this.mapTypes = this.data.maps.map(item => item.name);
        const partial_skill = [];
        const self_skill = [];
        let allUltimate = {
          Partial: { id: [], row: []},
          Self: { id: [], row: []},
        };
        const skill_obj = {
          Stirfry: 0,
          Boil: 0,
          Knife: 0,
          Fry: 0,
          Bake: 0,
          Steam: 0
        };
        const global_obj = {
          Male: 0,
          Female: 0,
          All: 0,
        }
        const price_obj = {
          PriceBuff_1: 0,
          PriceBuff_2: 0,
          PriceBuff_3: 0,
          PriceBuff_4: 0,
          PriceBuff_5: 0,
        };
        const limit_obj = {
          MaxLimit_1: 0,
          MaxLimit_2: 0,
          MaxLimit_3: 0,
          MaxLimit_4: 0,
          MaxLimit_5: 0,
        };
        this.data.chefs.forEach(item => {
          const id = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
          if (item.ultimateSkillCondition == 'Partial') {
            allUltimate.Partial.id.push(id);
            allUltimate.Partial.row.push({
              id,
              name: item.name,
              subName: item.ultimateSkillShow,
              type: item.ultimateSkill.effect[0].type,
              value: item.ultimateSkill.effect[0].value,
            });
            partial_skill.push({
              id,
              name: item.name,
              subName: item.ultimateSkillShow,
              type: item.ultimateSkill.effect[0].type,
              value: item.ultimateSkill.effect[0].value,
            });
          }
          if (item.ultimateSkillCondition == 'Self') {
            const effect = item.ultimateSkill.effect.filter(eff => {
              return eff.type != 'Material_Gain' && eff.type != 'GuestDropCount';
            });
            if (effect.length > 0) {
              allUltimate.Self.id.push(id);
              allUltimate.Self.row.push({
                id,
                name: item.name,
                subName: item.ultimateSkillShow,
                effect
              });
              self_skill.push({
                id,
                name: item.name,
                subName: item.ultimateSkillShow,
                effect
              });
            }
          }
          if (item.ultimateSkill && item.ultimateSkill.effect.length == 1) {
            const effect = item.ultimateSkill.effect[0];
            for (const key in skill_obj) {
              if (effect.condition == 'Global' && !effect.tag && effect.type == key) {
                skill_obj[key] += effect.value;
              }
            }
            for (let i = 1; i < 6; i++) {
              if (effect.type == 'UseAll' && effect.rarity == i) {
                price_obj[`PriceBuff_${i}`] += effect.value;
              }
              if (effect.type == 'MaxEquipLimit' && effect.rarity == i) {
                limit_obj[`MaxLimit_${i}`] += effect.value;
              }
            }
          }
          if (item.ultimateSkill && item.ultimateSkill.desc.indexOf('全技法') > -1) {
            const effect = item.ultimateSkill.effect[0];
            if (effect.tag == 1) {
              global_obj.Male += effect.value;
            } else if (effect.tag == 2) {
              global_obj.Female += effect.value;
            } else {
              global_obj.All += effect.value;
            }
          }
        });
        this.allUltimate = Object.assign({}, allUltimate, skill_obj, global_obj, price_obj, limit_obj);
        this.initChef();
        this.partial_skill_list = partial_skill;
        this.self_skill_list = self_skill;
        this.materials_list = this.data.materials.map(item => {
          return {
            id: item.materialId,
            name: item.name
          }
        });
        this.reps_list = this.data.recipes.map(item => {
          return {
            id: item.recipeId,
            name: item.name,
            skills: item.skills,
            price: item.price,
            time: item.time,
            rarity: item.rarity,
            materials_type: item.materials_type,
          }
        });
        this.calType.id = [0];
        this.rules = this.data.rules.map(item => {
          const arr = item.Title.split(' - ');
          return Object.assign({
            id: item.Id,
            name: arr[0],
            subName: arr[1] || ''
          }, item);
        });
        if (this.navId == 7) {
          this.tabBox = true;
          this.initCal();
        }
      },
      initCal() {
        this.initCalChef();
        this.initCalEquip();
        this.initCalRep();
      },
      initCalChef() {
        let chefs_list = [];
        for (const item of this.data.chefs) {
          const ultimateSkill = item.ultimateSkill || {};
          chefs_list.push({
            id: item.chefId,
            uid: `${item.chefId},${ultimateSkill.skillId}`,
            rarity: item.rarity,
            name: item.name,
            skills: {
              stirfry: item.stirfry,
              boil: item.boil,
              knife: item.knife,
              fry: item.fry,
              bake: item.bake,
              steam: item.steam,
            },
            skill_effect: item.skill_obj.effect,
            ultimate_effect: ultimateSkill.effect,
            tag: item.tags ? item.tags[0] : null
          });
        }
        chefs_list.sort(this.customSort({ prop: 'rarity', order: 'descending' }));
        this.calChefs_list = chefs_list;
      },
      initCalEquip() {
        this.calEquips_list = this.data.equips.map(item => {
          return {
            id: item.equipId,
            name: item.name,
            subName: item.skill,
            effect: item.effect
          }
        });
      },
      initCalRep() {
        const rep = [];
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const material_type = ['Meat', 'Vegetable', 'Creation', 'Fish'];
        for (let item of this.data.recipes) {
          if (this.calType.id[0] == 0) { // 正常营业
            let r = {};
            let buff = 100;

            r.buff_ulti = this.ulti[`PriceBuff_${item.rarity}`]; // 修炼菜谱售价加成
            buff += r.buff_ulti;

            r.price_buff = Math.ceil((item.price * buff) / 100);
            r.limit = item.limit + this.ulti[`MaxLimit_${item.rarity}`];
            r.price_total = r.price_buff * r.limit; // 未选厨子时的总价

            for (let i = 1; i < 4; i++) {
              if (this.calChefShow[i].id) { // 如果选了厨子
                let chef = {};
                let min = 4;
                let inf = [];
                let skill_buff = 0;
                let equip_buff = 0;
                chef.buff = buff;
                for (let sk in item.skills) { // 判断品级
                  let multi = Math.floor(this.calChefShow[i].skills_last[sk] / item.skills[sk]);
                  if (this.calChefShow[i].skills_last[sk] < item.skills[sk]) {
                    inf.push(`${this.skill_map[sk]}${this.calChefShow[i].skills_last[sk] - item.skills[sk]}`);
                  }
                  min = multi > min ? min : multi;
                }
                chef.grade = min; // 品级
                chef.buff_grade = this.skill_buff[min] || 0; // 品级加成
                chef.buff += chef.buff_grade;

                this.calChefShow[i].sum_skill_effect.forEach(eff => { // 技能
                  if (eff.type == 'Gold_Gain') { // 金币加成
                    skill_buff += eff.value;
                  }
                  if (eff.type.slice(0, 3) == 'Use' && skill_type.indexOf(eff.type.slice(3)) > -1) { // 技法类售价加成
                    if (item.skills[eff.type.slice(3).toLowerCase()]) {
                      skill_buff += eff.value;
                    }
                  }
                  if (eff.type.slice(0, 3) == 'Use' && material_type.indexOf(eff.type.slice(3)) > -1) { // 食材类售价加成
                    if (item.materials_type.indexOf(eff.type.slice(3).toLowerCase()) > -1) {
                      skill_buff += eff.value;
                    }
                  }
                });
                chef.skill_buff = skill_buff;
                chef.buff += skill_buff;

                // 厨具技能
                this.calChefShow[i].equip_effect.forEach(eff => { // 技能
                  if (eff.type == 'Gold_Gain') { // 金币加成
                    equip_buff += eff.value;
                  }
                  if (eff.type.slice(0, 3) == 'Use' && skill_type.indexOf(eff.type.slice(3)) > -1) { // 技法类售价加成
                    if (item.skills[eff.type.slice(3).toLowerCase()]) {
                      equip_buff += eff.value;
                    }
                  }
                  if (eff.type.slice(0, 3) == 'Use' && material_type.indexOf(eff.type.slice(3)) > -1) { // 食材类售价加成
                    if (item.materials_type.indexOf(eff.type.slice(3).toLowerCase()) > -1) {
                      equip_buff += eff.value;
                    }
                  }
                });
                chef.equip_buff = equip_buff;
                chef.buff += equip_buff;

                chef.price_buff = Math.ceil(item.price * chef.buff / 100);
                chef.price_total = chef.price_buff * r.limit;
                chef.subName = chef.price_total;
                if (min == 0) {
                  chef.subName += ' ' + inf.join(' ');
                }

                r[`chef_${i}`] = chef;
                r[`price_chef_${i}`] = chef.price_total;
              }
            }

            rep.push(Object.assign({
              id: item.recipeId,
              name: item.name,
              price: item.price
            }, r));
          }
        }
        for (let i = 1; i < 4; i++) {
          let list = JSON.parse(JSON.stringify(rep));
          if (this.calChefShow[i].id) { // 厨子菜谱排序
            list.sort(this.customSort({
              prop: `price_chef_${i}`,
              order: 'descending'
            }));
            this.calReps_list[i] = list.map(r => {
              r.subName = String(r[`chef_${i}`].subName);
              r.isf = r[`chef_${i}`].grade == 0 ? true : false; // 是否技法不足
              return r;
            });
          } else { // 无厨师
            list.sort(this.customSort({
              prop: 'price_total',
              order: 'descending'
            }));
            this.calReps_list[i] = list.map(r => {
              r.subName = String(r.price_total);
              return r;
            });
          }
        }
      },
      handleCalRepChange(row, key) {
        this.calRepCnt[key] = row[0] ? row[0].limit : 0;
      },
      handleRepCntChange(key, limit) {
        let val = this.calRepCnt[key];
        val = val.replace('.', '');
        val = val.replace('-', '');
        val = Number(val);
        val = val > limit ? limit : val;
        this.calRepCnt[key] = val;
      },
      showChef(chef, position) {
        let ultimate = false;
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const skills_show = {};
        const skills_last = {};
        let equip_effect = [];
        let sum_skill_effect = [];
        function judgeEff(eff) {
          return eff.condition == 'Self' && (eff.type.slice(0, 3) == 'Use' || eff.type == 'Gold_Gain' || eff.type == 'OpenTime');
        }
        if (this.calEquip[position].row[0]) { // 厨具
          equip_effect = this.calEquip[position].row[0].effect.filter(eff => { // 对售价/时间有影响的技能效果
            return judgeEff(eff);
          });
        }
        chef.skill_effect.forEach(eff => {
          if (judgeEff(eff)) { // 对售价/时间有影响的技能效果
            sum_skill_effect.push(eff);
          }
        });
        if (chef.ultimate_effect) {
          chef.ultimate_effect.forEach(eff => {
            if (judgeEff(eff)) { // 对售价/时间有影响的修炼技能效果
              sum_skill_effect.push(eff);
            }
          });
        }
        chef.equip_effect = equip_effect;
        chef.sum_skill_effect = sum_skill_effect;
        skill_type.forEach(key => {
          const lowKey = key.toLowerCase();
          let value = this.ulti.All; // 全体全技法
          value += this.ulti[key]; // 全体单技法
          if (chef.tag == 1) { // 男厨全技法
            value += this.ulti.Male;
          }
          if (chef.tag == 2) { // 女厨全技法
            value += this.ulti.Female;
          }
          if (this.ulti.Self.id.indexOf(chef.uid) > -1) { // 已修炼的个人类修炼技能
            ultimate = true;
            chef.ultimate_effect.forEach(eff => {
              if (eff.type == key) {
                value += eff.value;
              }
              if (eff.type == 'MutiEquipmentSkill' && eff.cal == 'Percent') { // 厨具技能加成
                if (this.calEquip[position].row[0]) { // 装备厨具
                  this.calEquip[position].row[0].effect.forEach(equ => {
                    if (equ.type == key) {
                      value += Math.ceil(equ.value * eff.value / 100);
                    }
                  });
                }
              }
            });
          }
          if (this.ulti.Partial.id.indexOf(chef.uid) > -1) {
            ultimate = true;
          }
          for (let i = 1; i < 4; i++) {
            if (this.calChef[i].row[0] && this.ulti.Partial.id.indexOf(this.calChef[i].row[0].uid) > -1) { // 已修炼且在场的上场类修炼技能
              this.calChef[i].row[0].ultimate_effect.forEach(eff => {
                if (eff.type == key && eff.condition == 'Partial') {
                  value += eff.value;
                }
              });
            }
          }
          if (this.calEquip[position].row[0]) { // 装备厨具
            this.calEquip[position].row[0].effect.forEach(eff => {
              if (eff.type == key) {
                value += eff.value;
              }
            });
          }
          skills_last[lowKey] = (chef.skills[lowKey] || 0) + value;
          skills_show[lowKey] = value ? `${chef.skills[lowKey] || ''}+${value}` : chef.skills[lowKey];
        });
        chef.skills_show = skills_show;
        chef.skills_last = skills_last;
        chef.ultimate = ultimate;
        return chef;
      },
      initRep() {
        this.recipes = [];
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const materials_type = ['Meat', 'Vegetable', 'Creation', 'Fish'];
        for (const item of this.data.recipes) {
          const s_name = this.checkKeyword(this.repKeyword, item.name);
          const s_origin = this.checkKeyword(this.repKeyword, item.origin);
          const s_material = this.checkKeyword(this.repKeyword, item.materials_search);
          const s_guest = this.checkKeyword(this.repKeyword, item.normal_guests);
          const search = s_name || s_origin || s_material || s_guest;
          const g_name = this.checkKeyword(this.guestKeyword, item.degree_guests);
          const g_gift = this.checkKeyword(this.guestKeyword, item.gift);
          const guest = g_name || g_gift;
          const f_rarity = this.repFilter.rarity[item.rarity];
          let f_skill = this.skill_type;
          for (const key in this.repFilter.skill) {
            if (this.repFilter.skill[key].flag) {
              if (this.skill_type) {
                f_skill = f_skill && Boolean(item[key]);
              } else {
                f_skill = f_skill || Boolean(item[key]);
              }
            }
          }
          let f_material = this.repFilter.material_type;
          for (const key in this.repFilter.material) {
            if (this.repFilter.material[key].flag) {
              if (this.repFilter.material_type) {
                f_material = f_material && (item.materials_type.indexOf(key) > -1);
              } else {
                f_material = f_material || (item.materials_type.indexOf(key) > -1);
              }
            }
          }
          const f_guest = !this.repFilter.guest || item.normal_guests;
          const f_combo = !this.repFilter.combo || item.combo;
          const f_price = item.price > this.repFilter.price;
          let f_material_eff = true;
          const ext = {};
          const materialEff = this.repFilter.materialEff;
          if (materialEff.id && materialEff.id.length > 0) {
            f_material_eff = false;
            materialEff.id.forEach(id => {
              let material = item.materials.find(m => {
                return m.material == id;
              });
              ext[`materialEff_${id}`] = material ? Math.floor(material.quantity * 3600 / item.time) : null;
              f_material_eff = f_material_eff || Boolean(material);
            });
          }
          if (search && guest && f_rarity && f_skill && f_material && f_guest && f_combo && f_price && f_material_eff) {
            const chef_ext = {};
            this.repChef.row.forEach(chef => {
              let min = 4;
              const diff = [];
              let diff_sum = 0;
              let buff = 100;
              for (const key in item.skills) {
                const grade = Math.floor(chef.skills[key] / item.skills[key]);
                min = grade >= min ? min : grade;
                if (grade < 4) {
                  const diff_value = item.skills[key] * 4 - chef.skills[key];
                  diff.push(`${this.skill_map[key]}-${diff_value}`);
                  diff_sum += diff_value;
                }
              }
              if (min > 0) { // 技法足够
                buff += this.skill_buff[min]; // 品级加成
              }
              if (this.chefUltimate) {
                if (this.chefUseAllUltimate) { // 使用全修炼
                  buff += (this.allUltimate['PriceBuff_' + item.rarity] || 0); // *星菜谱售价加成
                } else {
                  buff += (this.userUltimate['PriceBuff_' + item.rarity] || 0); // *星菜谱售价加成
                }
              }
              // 技能/修炼技能加成（如果修炼没开在chefs_list就过滤掉了）
              chef.effect.forEach(eff => {
                const type = eff.type.slice(3);
                if (skill_type.indexOf(type) > -1 && item[type.toLowerCase()]) { // 技法类售价
                  buff += eff.value;
                }
                if (materials_type.indexOf(type) > -1 && item.materials_type.indexOf(type.toLowerCase()) > -1) { // 食材类售价
                  buff += eff.value;
                }
                if (eff.type == 'Gold_Gain') { // 金币获得
                  buff += eff.value;
                }
              });
              chef_ext[`chef_grade_${chef.id}`] = ' 可优特神'.slice(min, min + 1);
              chef_ext[`chef_diff_${chef.id}`] = diff.join('\n');
              chef_ext[`chef_eff_${chef.id}`] = min == 0 ? '' : Math.floor(Math.ceil(item.price * buff / 100) * 3600 / item.time);
              chef_ext[`chef_diff_value_${chef.id}`] = diff_sum;
              chef_ext[`chef_grade_value_${chef.id}`] = min;
            });
            this.recipes.push(Object.assign({}, item, ext, chef_ext));
          }
        }
        if (this.sort.rep.order) {
          this.handleRepSort(this.sort.rep);
        } else {
          this.recipesCurPage = 1;
          this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
        }
        this.$nextTick(() => {
          this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
        });
        this.loading = false;
      },
      initChef() {
        this.chefs = [];
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const materials_type = ['Meat', 'Vegetable', 'Creation', 'Fish'];
        const userUltimate = {};
        for (const key in this.userUltimate) {
          if (typeof this.userUltimate[key] == 'string') {
            userUltimate[key] = Number(this.userUltimate[key]);
          } else {
            userUltimate[key] = JSON.parse(JSON.stringify(this.userUltimate[key]));
          }
        }
        let chefs_list = [];
        for (const item of this.data.chefs) {
          const s_name = this.checkKeyword(this.chefFilter.chefKeyword, item.name);
          const s_skill = this.checkKeyword(this.chefFilter.chefKeyword, item.skill);
          const s_origin = this.checkKeyword(this.chefFilter.chefKeyword, item.origin);
          const search = s_name || s_skill || s_origin;
          const f_rarity = this.chefFilter.rarity[item.rarity];
          const sex_check = [];
          for (key in this.chefFilter.sex) {
            if (this.chefFilter.sex[key].flag) {
              sex_check.push(this.chefFilter.sex[key].name);
            }
          }
          const f_sex = sex_check.indexOf(item.sex || '未知') > -1;
          const skill_arr = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
          const ultimate = {};
          const skills = {};
          skill_arr.forEach(key => {
            if (this.chefUltimate) {
              let value = 0;
              const partial_id = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
              const effect = item.ultimateSkill ? item.ultimateSkill.effect : [];
              const partial_skill = this.partial_skill.row;
              if (this.chefUseAllUltimate) {
                value += this.allUltimate[key] + this.allUltimate.All + (item.tags ? (item.tags[0] == 1 ? this.allUltimate.Male : this.allUltimate.Female) : 0);
                partial_skill.forEach(s => { // 上场类技能-给别人加
                  if (s.type == key && s.id != partial_id) {
                    value += s.value;
                  }
                });
              } else {
                value += (userUltimate[key] || 0) + (userUltimate.All || 0) + ((item.tags ? (item.tags[0] == 1 ? userUltimate.Male : userUltimate.Female) : 0) || 0);
                partial_skill.forEach(s => { // 上场类技能-给别人加
                  if (s.type == key && (s.id != partial_id || userUltimate.Partial.id.indexOf(s.id) < 0)) {
                    value += s.value;
                  }
                });
              }
              effect.forEach(eff => {
                if (this.chefUseAllUltimate) {
                  if (this.allUltimate.Partial.id.indexOf(partial_id) > -1 && eff.type == key) { // 上场类技能-给自己加
                    value += eff.value;
                  }
                  if (this.allUltimate.Self.id.indexOf(partial_id) > -1 && eff.type == key) { // 给自己加的修炼技能
                    value += eff.value;
                  }
                } else {
                  if (userUltimate.Partial.id.indexOf(partial_id) > -1 && eff.type == key) { // 上场类技能-给自己加
                    value += eff.value;
                  }
                  if (userUltimate.Self.id.indexOf(partial_id) > -1 && eff.type == key) { // 给自己加的修炼技能
                    value += eff.value;
                  }
                }
              });
              ultimate[`${key}_show`] = (item[key.toLowerCase()] || '') + `${value ? '+' + value : ''}`;
              ultimate[`${key}_last`] = (item[key.toLowerCase()] + value) || '';
            } else {
              ultimate[`${key}_show`] = item[key.toLowerCase()];
              ultimate[`${key}_last`] = item[key.toLowerCase()] || '';
            }
            skills[key.toLowerCase()] = ultimate[`${key}_last`] || 0;
          });

          let f_skills = true;
          for (key in this.chefFilter.skills) {
            const lastKey = key.slice(0, 1).toUpperCase() + key.slice(1) + '_last';
            f_skills = f_skills && (ultimate[lastKey] >= this.chefFilter.skills[key].val);
          }

          let effect = item.skill_obj.effect;
          const uId = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
          if (this.chefUltimate && ((this.chefUseAllUltimate && this.allUltimate.Self.id.indexOf(uId) > -1) || userUltimate.Self.id.indexOf(uId) > -1)) { // 个人类修炼
            effect = effect.concat(item.ultimateSkill.effect);
          }
          chefs_list.push({
            id: item.chefId,
            name: item.name,
            skills,
            effect
          });
          if (search && f_rarity && f_skills && f_sex) {
            const rep_ext = {};
            this.chefRep.row.forEach(rep => {
              let min = 4;
              const diff = [];
              let diff_sum = 0;
              let buff = 100;
              for (const key in rep.skills) {
                const chef_key = key.slice(0, 1).toUpperCase() + key.slice(1) + '_last';
                const grade = Math.floor((ultimate[chef_key] || 0) / rep.skills[key]);
                min = grade > min ? min : grade;
                if (grade < 4) {
                  const diff_value = rep.skills[key] * 4 - ultimate[chef_key];
                  diff.push(`${this.skill_map[key]}-${diff_value}`);
                  diff_sum += diff_value;
                }
              }
              if (min > 0) { // 技法足够
                buff += this.skill_buff[min]; // 品级加成
                if (this.chefUltimate) { // 修炼加成
                  if (this.chefUseAllUltimate) { // 使用全修炼
                    buff += (this.allUltimate['PriceBuff_' + rep.rarity] || 0); // *星菜谱售价加成
                  } else {
                    buff += (this.userUltimate['PriceBuff_' + rep.rarity] || 0); // *星菜谱售价加成
                  }
                }
                // 技能/修炼技能加成（如果修炼没开在effect就过滤掉了）
                effect.forEach(eff => {
                  const type = eff.type.slice(3);
                  if (skill_type.indexOf(type) > -1 && rep.skills[type.toLowerCase()]) { // 技法类售价
                    buff += eff.value;
                  }
                  if (materials_type.indexOf(type) > -1 && rep.materials_type.indexOf(type.toLowerCase()) > -1) { // 食材类售价
                    buff += eff.value;
                  }
                  if (eff.type == 'Gold_Gain') { // 金币获得
                    buff += eff.value;
                  }
                });
              }
              rep_ext[`rep_grade_${rep.id}`] = ' 可优特神'.slice(min, min + 1);
              rep_ext[`rep_diff_${rep.id}`] = diff.join('\n');
              rep_ext[`rep_eff_${rep.id}`] = min == 0 ? '' : Math.floor(Math.ceil(rep.price * buff / 100) * 3600 / rep.time);
              rep_ext[`rep_diff_value_${rep.id}`] = diff_sum;
              rep_ext[`rep_grade_value_${rep.id}`] = min;
            });
            this.chefs.push(Object.assign({}, item, ultimate, skills, rep_ext));
          }
        }
        this.chefs_list = chefs_list;
        if (this.sort.chef.order) {
          this.handleChefSort(this.sort.chef);
        } else {
          this.chefsCurPage = 1;
          this.chefsPage = this.chefs.slice(0, this.chefsPageSize);
        }
        this.$nextTick(() => {
          this.$refs.chefsTable.bodyWrapper.scrollTop = 0;
        });
      },
      initEquip() {
        this.equips = [];
        for (const item of this.data.equips) {
          const s_name = this.checkKeyword(this.equipFilter.equipKeyword, item.name);
          const s_skill = this.checkKeyword(this.equipFilter.equipKeyword, item.skill);
          const s_origin = this.checkKeyword(this.equipFilter.equipKeyword, item.origin);
          const search = s_name || s_skill || s_origin;
          const f_rarity = this.equipFilter.rarity[item.rarity];
          let f_skill = this.equip_concurrent;
          for (const key in this.equipFilter.skillType) {
            if (this.equipFilter.skillType[key].flag) {
              if (this.equip_concurrent) {
                f_skill = f_skill && this.checkEquipSkillType(key, {
                  obj: item.skill_type,
                  desc: item.skill
                });
              } else {
                f_skill = f_skill || this.checkEquipSkillType(key, {
                  obj: item.skill_type,
                  desc: item.skill
                });
              }
            }
          }
          if (search && f_rarity && f_skill) {
            this.equips.push(item);
          }
        }
        if (this.sort.equip.order) {
          this.handleEquipSort(this.sort.equip);
        } else {
          this.equipsCurPage = 1;
          this.equipsPage = this.equips.slice(0, this.equipsPageSize);
        }
        this.$nextTick(() => {
          this.$refs.equipsTable.bodyWrapper.scrollTop = 0;
        });
      },
      initDecoration() {
        this.decorations = [];
        const position_arr = this.decorationFilter.position.filter(p => { return p.flag }).map(p => p.name);
        for (item of this.data.decorations) {
          const s_name = this.checkKeyword(this.decorationFilter.keyword, item.name);
          const s_suit = this.checkKeyword(this.decorationFilter.keyword, item.suit);
          const s_origin = this.checkKeyword(this.decorationFilter.keyword, item.origin);
          const search = s_name || s_suit || s_origin;
          const f_postion = position_arr.indexOf(item.position) > -1;
          if (search && f_postion) {
            this.decorations.push(item);
          }
        }
        if (this.sort.decoration.order) {
          this.handleDecorationSort(this.sort.decoration);
        } else {
          this.decorationsCurPage = 1;
          const decorationsPage = this.decorations.slice(0, this.decorationsPageSize)
          this.decorationsPage = decorationsPage.map(d => {
            return Object.assign({}, d, checked);
          });
        }
        this.$nextTick(() => {
          this.$refs.decorationsTable.bodyWrapper.scrollTop = 0;
        });
      },
      initMap() {
        function percent(val, per) {
          return Math.ceil((val * (100 + Number(per)) / 100))
        }
        this.maps = this.data.maps.map(item => {
          const label = item.time.map(t => {
            return this.formatTime(t);
          });
          const sum = {
            0: [0, 0],
            1: [0, 0],
            2: [0, 0],
            3: [0, 0],
            4: [0, 0],
          };
          const materials = item.materials.map(m => {
            const avg = [];
            const ext = {};
            for (const i of [0, 1, 2, 3, 4]) {
              let min = m.quantity[i][0];
              let max = m.quantity[i][1];
              if (this.mapFilter.season) {
                min = min + m.season[i];
                max = max + m.season[i];
              }
              if (this.mapFilter.skill && !isNaN(Number(this.mapFilter.skill))) {
                min = percent(min, this.mapFilter.skill);
                max = percent(max, this.mapFilter.skill);
              }
              if (this.mapFilter.cnt != '' && this.mapFilter.cnt < m.skill) {
                min = 0;
                max = 0;
              }
              sum[i][0] += min;
              sum[i][1] += max;
              ext[i] = min ? `${min} ~ ${max}` : '0';
              avg.push(Math.round((min + max) / 2 * 36000 / item.time[i]) / 10);
            }
            let rst = {
              name: m.name,
              skill: m.skill,
              avg
            };
            Object.assign(rst, ext);
            return rst;
          });
          const sum_show = {
            name: '总计',
            skill: null,
          };
          for (let key in sum) {
            sum_show[key] = sum[key][1] ? `${sum[key][0]} ~ ${sum[key][1]}` : 0;
          }
          materials.push(sum_show);
          return {
            name: item.name,
            label,
            materials,
          }
        });
        const map = this.maps.find(m => {
          return m.name === this.mapType;
        });
        this.mapLabel = map.label;
        this.mapsPage = map.materials;
        this.$nextTick(() => {
          this.$refs.decorationsTable.bodyWrapper.scrollTop = 0;
        });
        const legends = [];
        let series = map.materials.map(item => {
          if (item.name !== '总计') {
            legends.push(item.name);
          }
          return {
            name: item.name,
            data: item.avg,
            type: 'line',
            stack: '总量',
            areaStyle: {},
          };
        });
        series = series.slice(0, series.length - 1);
        if (series.length === 5) {
          series.push({
            name: '占位',
            data: [],
            type: 'line',
            stack: '总量',
            areaStyle: {},
          })
        }
        const chartOption = {
          title: {
            text: '每小时平均采集量',
            textStyle: {
              fontSize: 16
            },
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            top: 22,
            data: legends
          },
          grid: {
            left: '3%',
            right: '7%',
            bottom: '3%',
            top: 68,
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: map.label
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series
        };
        const myChart = echarts.init(document.getElementById('chart'));
        myChart.setOption(chartOption);
      },
      checkEquipSkillType(key, { obj, desc }) {
        if (key === 'AllSkill') {
          return this.equipFilter.buff ? desc.indexOf('全技法+') > -1 : desc.indexOf('全技法') > -1;
        } else if (key === 'AllMap') {
          return this.equipFilter.buff ? desc.indexOf('全采集+') > -1 : desc.indexOf('全采集') > -1;
        } else {
          return this.equipFilter.buff ? obj[key] === 'buff' : Boolean(obj[key]);
        }
      },
      checkKeyword(keyword, str) {
        if (!keyword) {
          return true;
        }
        const arr = keyword.split(' ');
        for (let k of arr) {
          if (k && str.indexOf(k) > -1) {
            return true;
          }
        }
        return false;
      },
      formatTime(sec) {
        return (sec >= 3600 ? `${~~(sec / 3600)}小时` : '') + ((sec % 3600) >= 60 ? `${~~((sec % 3600) / 60)}分` : '') + ((sec % 3600) % 60 !== 0 ? `${(sec % 3600) % 60}秒` : '')
      },
      handleCurrentChange(val) {
        const map = {
          1: 'recipes',
          2: 'chefs',
          3: 'equips',
          4: 'decorations'
        }
        const nav = this.navId;
        if (nav === 6) {
          this.questsCurPage = val;
          const size = this.questsPageSize;
          const quests = this.questsType === 1 ? this.questsMain : this.questsRegional;
          this.questsPage = quests.slice((val - 1) * size, val * size);
          this.$refs.questsTable.bodyWrapper.scrollTop = 0;
        } else if (nav === 4) {
          this[map[nav] + 'CurPage'] = val;
          const size = this[map[nav] + 'PageSize'];
          const page = this[map[nav]].slice((val - 1) * size, val * size);
          this[map[nav] + 'Page'] = page.map(item => {
            let rst = {
              checked: this.decoSelectId.indexOf(item.id) > -1
            }
            return Object.assign(rst, item);
          });
        } else {
          this[map[nav] + 'CurPage'] = val;
          const size = this[map[nav] + 'PageSize'];
          this[map[nav] + 'Page'] = this[map[nav]].slice((val - 1) * size, val * size);
        }
      },
      handleRepSort(sort) {
        this.sort.rep = sort;
        const map = {
          time_show: 'time',
          rarity_show: 'rarity',
          total_time_show: 'total_time'
        };
        if (!sort.order) {
          this.initRep();
        }
        sort.prop = map[sort.prop] || sort.prop;
        let arr = sort.prop.split('_');
        let id = arr[arr.length - 1];
        if (sort.prop.indexOf('chef_diff_') > -1) {
          sort.prop = 'chef_diff_value_' + id;
        }
        if (sort.prop.indexOf('chef_grade_') > -1) {
          sort.prop = 'chef_grade_value_' + id;
        }
        this.recipesCurPage = 1;
        this.recipes.sort(this.customSort(sort));
        this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
      },
      handleChefSort(sort) {
        this.sort.chef = sort;
        const map = {
          rarity_show: 'rarity',
          Stirfry_show: 'Stirfry_last',
          Boil_show: 'Boil_last',
          Knife_show: 'Knife_last',
          Bake_show: 'Bake_last',
          Fry_show: 'Fry_last',
          Steam_show: 'Steam_last',
        };
        if (!sort.order) {
          this.initChef();
        }
        let arr = sort.prop.split('_');
        let id = arr[arr.length - 1];
        if (sort.prop.indexOf('rep_diff_') > -1) {
          sort.prop = 'rep_diff_value_' + id;
        }
        if (sort.prop.indexOf('rep_grade_') > -1) {
          sort.prop = 'rep_grade_value_' + id;
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.chefsCurPage = 1;
        this.chefs.sort(this.customSort(sort));
        this.chefsPage = this.chefs.slice(0, this.chefsPageSize);
      },
      handleEquipSort(sort) {
        this.sort.equip = sort;
        const map = {
          rarity_show: 'rarity',
        };
        if (!sort.order) {
          this.initEquip();
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.equipsCurPage = 1;
        this.equips.sort(this.customSort(sort));
        this.equipsPage = this.equips.slice(0, this.equipsPageSize);
      },
      handleDecorationSort(sort) {
        this.sort.decoration = sort;
        const map = {
          gold_show: 'gold',
          tipTime_show: 'tipTime',
          suitGold_show: 'suitGold',
        };
        if (!sort.order) {
          this.initDecoration();
        }
        if (sort.prop == 'checkbox') {
          this.decorations.sort((r1, r2) => {
            if (this.decoSelectId.indexOf(r1.id) > -1 && this.decoSelectId.indexOf(r2.id) < 0) {
              return sort.order == 'descending' ? -1 : 1;
            } else if (this.decoSelectId.indexOf(r2.id) > -1 && this.decoSelectId.indexOf(r1.id) < 0) {
              return sort.order == 'descending' ? 1 : -1;
            } else {
              return 0;
            }
          });
        } else {
          sort.prop = map[sort.prop] || sort.prop;
          this.decorationsCurPage = 1;
          this.decorations.sort(this.customSort(sort));
        }
        const decorationsPage = this.decorations.slice(0, this.decorationsPageSize);
        this.decorationsPage = decorationsPage.map(r => {
          Object.assign(r, { checked: this.decoSelectId.indexOf(r.id) > -1 });
          return r;
        });
      },
      checkRow(curRow) {
        console.log(curRow);
        if (curRow) {
          const val = !curRow.checked;
          this.handleSelectionChange(val, curRow);
        }
      },
      handleSelectionChange(val, row) {
        let newSelect = [];
        if (val) {
          newSelect = this.decoSelect.filter(r => {
            return r.position !== row.position;
          });
          newSelect.push(row);
        } else {
          newSelect = this.decoSelect.filter(r => {
            return r.id !== row.id;
          });
        }
        this.decoSelect = newSelect;
        this.decoSelectId = newSelect.map(r => r.id);
        this.decorationsPage = this.decorationsPage.map(d => {
          Object.assign(d, { checked: this.decoSelectId.indexOf(d.id) > -1 });
          return d;
        });
        let avg = 0;
        let gold = 0;
        newSelect.forEach(r => {
          gold += r.gold;
          avg += r.effAvg;
        });
        avg = Math.round(avg * 10) / 10;
        let suit = newSelect.map(r => r.suit);
        suit = Array.from(new Set(suit));
        for (const s of suit) {
          let suitGold = 0;
          const notIn = this.data.decorations.filter(item => {
            if (!suitGold && item.suit == s) {
              suitGold = item.suitGold;
            }
            return item.suit == s && this.decoSelectId.indexOf(item.id) < 0;
          });
          if (notIn.length == 0) {
            gold += suitGold;
          }
        }
        gold = Math.round(gold * 1000) / 10 + '%';
        this.decoBuff = `平均玉璧/天: ${avg} 收入加成: ${gold}`;
      },
      empty() {
        this.decoSelect = [];
        this.decoSelectId = [];
        this.handleSelectionChange(false, {});
        if (this.sort.decoration.prop == 'checkbox') {
          this.$refs.decorationsTable.clearSort();
        }
      },
      selectSuit(val) {
        this.decoSelect = [];
        this.decoSelectId = [];
        this.data.decorations.forEach(r => {
          if (r.suit == val) {
            this.decoSelect.push(r);
            this.decoSelectId.push(r.id);
          }
        });
        this.handleSelectionChange(false, {});
        this.$refs.decorationsTable.sort('checkbox', 'descending');
      },
      clearFilterSkills() {
        this.chefFilter.skills = JSON.parse(JSON.stringify(this.originChefFilter.skills))
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
      selectAll(obj) {
        let flag = false;
        if (obj === 'repFilter.skill') {
          this.skill_radio = false;
          this.skill_type = false;
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          for (const key in skill) {
            if (!skill[key].flag) {
              flag = true;
            }
          }
          for (const key in skill) {
            skill[key].flag = flag;
          }
          this.repFilter.skill = skill;
        } else if (obj === 'equipFilter.skillType') {
          this.equip_radio = false;
          this.equip_concurrent = false;
          const skillType = JSON.parse(JSON.stringify(this.equipFilter.skillType));
          for (const key in skillType) {
            if (!skillType[key].flag) {
              flag = true;
            }
          }
          for (const key in skillType) {
            skillType[key].flag = flag;
          }
          this.equipFilter.skillType = skillType;
        } else if (obj === 'decorationFilter.position') {
          this.decoration_radio = false;
          const position = JSON.parse(JSON.stringify(this.decorationFilter.position));
          for (const key in position) {
            if (!position[key].flag) {
              flag = true;
            }
          }
          for (const key in position) {
            position[key].flag = flag;
          }
          this.decorationFilter.position = position;
        } else {
          for (const key in this[obj]) {
            if (!this[obj][key]) {
              flag = true;
            }
          }
          let object = {};
          for (const key in this[obj]) {
            object[key] = flag;
          }
          this[obj] = JSON.parse(JSON.stringify(object));
        }
      },
      checkSkill(key) {
        if (this.skill_radio) {
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          for (const k in skill) {
            if (k === key) {
              skill[k].flag = !skill[k].flag;
            } else {
              skill[k].flag = false;
            }
          }
          this.repFilter.skill = skill;
        } else {
          this.repFilter.skill[key].flag = !this.repFilter.skill[key].flag;
        }
      },
      checkSkillType(key) {
        if (this.equip_radio) {
          const skill = JSON.parse(JSON.stringify(this.equipFilter.skillType));
          for (const k in skill) {
            if (k === key) {
              skill[k].flag = !skill[k].flag;
            } else {
              skill[k].flag = false;
            }
          }
          this.equipFilter.skillType = skill;
        } else {
          this.equipFilter.skillType[key].flag = !this.equipFilter.skillType[key].flag;
        }
      },
      changeSkillRadio(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          let cnt = 0;
          for (const key in skill) {
            if (skill[key].flag) {
              cnt++;
            }
          }
          if (cnt > 1) {
            for (const key in skill) {
              skill[key].flag = false;
            }
            this.repFilter.skill = skill;
          }
        }
      },
      changeSkillType(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          let cnt = 0;
          for (const key in skill) {
            if (skill[key].flag) {
              cnt++;
            }
          }
          if (cnt > 2) {
            for (const key in skill) {
              skill[key].flag = false;
            }
            this.repFilter.skill = skill;
          } else {
            this.initRep();
          }
        } else {
          this.initRep();
        }
      },
      changeEquipRadio(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.equipFilter.skillType));
          let cnt = 0;
          for (const key in skill) {
            if (skill[key].flag) {
              cnt++;
            }
          }
          if (cnt > 1) {
            for (const key in skill) {
              skill[key].flag = false;
            }
            this.equipFilter.skillType = skill;
          }
        }
      },
      changeEquipConcurrent(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.equipFilter.skillType));
          let cnt = 0;
          for (const key in skill) {
            if (skill[key].flag) {
              cnt++;
            }
          }
          if (cnt > 2) {
            for (const key in skill) {
              skill[key].flag = false;
            }
            this.equipFilter.skillType = skill;
          } else {
            this.initEquip();
          }
        } else {
          this.initEquip();
        }
      },
      changeDecorationRadio(val) {
        if (val) {
          const position = JSON.parse(JSON.stringify(this.decorationFilter.position));
          let cnt = 0;
          for (const key in position) {
            if (position[key].flag) {
              cnt++;
            }
          }
          if (cnt > 1) {
            for (const key in position) {
              position[key].flag = false;
            }
            this.decorationFilter.position = position;
          }
        }
      },
      checkPosition(i) {
        if (this.decoration_radio) {
          const position = JSON.parse(JSON.stringify(this.decorationFilter.position));
          for (let j = 0; j < position.length; j++) {
            if (i === j) {
              position[j].flag = !position[j].flag;
            } else {
              position[j].flag = false;
            }
          }
          this.decorationFilter.position = position;
        } else {
          this.decorationFilter.position[i].flag = !this.decorationFilter.position[i].flag;
        }
      },
      reset() {
        const map = {
          1: 'Rep',
          2: 'Chef',
          3: 'Equip',
          4: 'Decoration'
        };
        this[map[this.navId].toLowerCase() + 'Filter'] = JSON.parse(JSON.stringify(this['origin' + map[this.navId] + 'Filter']));
        if (this.navId === 1) {
          this.skill_radio = false;
          this.skill_type = false;
          this.repKeyword = '';
          this.guestKeyword = '';
          this.$refs.materialEff.clear();
        } else if (this.navId === 3) {
          this.equip_radio = false;
          this.equip_concurrent = false;
        } else if (this.navId === 4) {
          this.decoration_radio = false;
        }
      },
      scroll(val) {
        if (window.innerWidth < 669) {
          if ($('.el-drawer__body').scrollTop() < val) {
            $('.el-drawer__body').scrollTop(val);
          }
        } else if (val > 300) {
          $('.el-drawer__body').scrollTop(val);
        }
      },
      scrollUser(val) {
        if (window.innerWidth < 669) {
          if ($('.ultimate-box').scrollTop() < val) {
            $('.ultimate-box').scrollTop(val);
          }
        }
      },
      saveUserData() {
        const userData = {
          repCol: this.repCol,
          chefCol: this.chefCol,
          equipCol: this.equipCol,
          decorationCol: this.decorationCol,
          mapCol: this.mapCol,
          userUltimate: this.userUltimate,
        };
        localStorage.setItem('data', JSON.stringify(userData));
      },
      getUserData() {
        let userData = localStorage.getItem('data');
        const colName = ['repCol', 'chefCol', 'equipCol', 'decorationCol', 'mapCol', 'userUltimate'];
        if (userData) {
          try {
            this.userData = JSON.parse(userData);
            colName.forEach(col => {
              this.putUserCol(col);
            });
          } catch(e) {
            this.$message.error('个人数据解析错误！');
          }
        }
      },
      exportUserDataText() {
        this.saveUserData();
        this.userDataText = localStorage.getItem('data');
      },
      importUserDataText() {
        let data;
        try {
          data = JSON.parse(this.userDataText);
          localStorage.setItem('data', this.userDataText);
          this.getUserData();
          setTimeout(() => {
            this.$refs.userPartial.initOption();
            this.$refs.userSelf.initOption();
          }, 50);
          this.userDataText = '';
          this.$message.success('导入成功');
        } catch(e) {
          this.$message.error('导入失败');
        }
      },
      exportUserData() {
        this.saveUserData();
        let dataText = localStorage.getItem('data');
        let a = document.createElement('a');
        a.href = 'data:text/plain;charset=utf-8,' + dataText;
        a.download = 'userData';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      openFile() {
        $('#file').click();
      },
      importUserData(e) {
        const input = event.target;
        const reader = new FileReader();
        const that = this;
        reader.onload = function() {
          if(reader.result) {
            let data;
            try {
              data = JSON.parse(reader.result);
              localStorage.setItem('data', reader.result);
              that.getUserData();
              setTimeout(() => {
                that.$refs.userPartial.initOption();
                that.$refs.userSelf.initOption();
              }, 50);
              that.$message.success('导入成功');
            } catch(e) {
              that.$message.error('导入失败');
            }
          }
        };
        reader.readAsText(input.files[0]);
      },
      putUserCol(key) {
        const col = {};
        if (this.userData[key]) {
          for (const k in this[key]) {
            col[k] = this.userData[key][k] != undefined ? this.userData[key][k] : this[key][k];
          }
          this[key] = col;
        }
      },
      changeChefUltimate(val) {
        this.initChef();
        if (!val) {
          this.$refs.chefRep.clear();
        }
      },
      setAllUltimate() {
        this.userUltimate = JSON.parse(JSON.stringify(this.allUltimate));
        setTimeout(() => {
          this.$refs.userPartial.initOption();
          this.$refs.userSelf.initOption();
        }, 50);
      },
      emptyUserUltimate() {
        this.userUltimate = {
          decoBuff: '',
          Stirfry: '',
          Boil: '',
          Knife: '',
          Fry: '',
          Bake: '',
          Steam: '',
          Male: '',
          Female: '',
          All: '',
          Partial: { id: [], row: [] },
          Self: { id: [], row: [] },
          MaxLimit_1: '',
          MaxLimit_2: '',
          MaxLimit_3: '',
          MaxLimit_4: '',
          MaxLimit_5: '',
          PriceBuff_1: '',
          PriceBuff_2: '',
          PriceBuff_3: '',
          PriceBuff_4: '',
          PriceBuff_5: '',
        };
        this.$refs.userPartial.clear();
        this.$refs.userSelf.clear();
      },
      clickOther(e) {
        let focus = false;
        this.$refs.chefBox.forEach(b => {
          focus = focus || b.contains(e.target);
        });
        focus = focus || this.$refs.tool.contains(e.target);
        if (!focus) {
          this.calFocus = false;
        }
      },
      calCheck(key) {
        const arr = key.split('_');
        if (this.calFocus != key) {
          this.calFocus = key;
          if (this[`cal${arr[0]}`][arr[1]].row.length == 0) {
            this.$refs[`cal${key}`][0].unfold();
          }
        } else {
          window.removeEventListener('click', this.clickOther);
          this.$refs[`cal${key}`][0].clear();
          setTimeout(() => {
            window.addEventListener('click', this.clickOther);
          }, 100);
          this.$refs[`cal${key}`][0].unfold();
        }
      }
    },
    watch: {
      screenHeight(val) {
        if (this.originHeight - val > 150) {
          this.isOriginHei = false;
        } else {
          this.isOriginHei = true;
          this.tableHeight = window.innerHeight - 122;
          this.boxHeight = window.innerHeight - 50;
          this.chartHeight = window.innerHeight - 390;
        }
      },
      repCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            this.$refs.recipesTable.doLayout();
          });
        }
      },
      repFilter: {
        deep: true,
        handler() {
          this.initRep();
          this.$nextTick(()=>{
            this.$refs.recipesTable.doLayout();
          });
        }
      },
      repChef: {
        deep: true,
        handler() {
          this.initRep();
          this.$nextTick(()=>{
            this.$refs.recipesTable.doLayout();
          });
        }
      },
      chefCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            this.$refs.chefsTable.doLayout();
          });
        }
      },
      chefFilter: {
        deep: true,
        handler() {
          this.initChef();
          this.$nextTick(()=>{
            this.$refs.chefsTable.doLayout();
          });
        }
      },
      chefRep: {
        deep: true,
        handler() {
          this.initChef();
          this.$nextTick(()=>{
            this.$refs.chefsTable.doLayout();
          });
        }
      },
      partial_skill: {
        deep: true,
        handler() {
          this.initChef();
          this.$nextTick(()=>{
            this.$refs.chefsTable.doLayout();
          });
        }
      },
      equipCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            this.$refs.equipsTable.doLayout();
          });
        }
      },
      equipFilter: {
        deep: true,
        handler() {
          this.initEquip();
          this.$nextTick(()=>{
            this.$refs.equipsTable.doLayout();
          });
        }
      },
      decorationCol: {
        deep: true,
        handler() {
          this.saveUserData();
        }
      },
      decorationFilter: {
        deep: true,
        handler() {
          this.initDecoration();
          this.$nextTick(()=>{
            this.$refs.decorationsTable.doLayout();
          });
        }
      },
      mapFilter: {
        deep: true,
        handler() {
          this.initMap();
          this.$nextTick(()=>{
            this.$refs.mapsTable.doLayout();
          });
        }
      },
      mapCol: {
        deep: true,
        handler() {
          this.saveUserData();
        }
      },
      userUltimate: {
        deep: true,
        handler(val) {
          this.userUltimateChange = true;
          this.saveUserData();
        }
      },
      calChefShow: {
        deep: true,
        handler() {
          this.initCalRep();
        }
      },
      calFocus(val) {
        if (val) {
          window.addEventListener("click", this.clickOther);
        } else {
          window.removeEventListener('click', this.clickOther);
        }
      },
      rightBar(val) {
        if (val) {
          setTimeout(() => {
            $('.el-drawer__body').scrollTop(0);
          }, 100);
        }
      },
      mapType() {
        this.initMap();
      },
      repKeyword() {
        this.initRep();
      },
      guestKeyword() {
        this.initRep();
      },
      questsType() {
        this.initQuests();
      },
      questsKeyword() {
        this.initQuests();
      },
      navId(val) {
        if (val === 1) {
          if (this.recipes.length == 0) {
            this.initRep();
          }
          if (this.chefUltimate && !this.chefUseAllUltimate && this.userUltimateChange) {
            this.userUltimateChange = false;
            this.initChef();
          }
          this.$nextTick(()=>{
            this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
            this.$refs.recipesTable.bodyWrapper.scrollLeft = 0;
            this.$refs.recipesTable.doLayout();
          });
        } else if (val == 2) {
          if (this.chefs.length == 0 || (this.chefUltimate && !this.chefUseAllUltimate && this.userUltimateChange)) {
            this.userUltimateChange = false;
            this.initChef();
          }
          this.$nextTick(()=>{
            this.$refs.chefsTable.bodyWrapper.scrollTop = 0;
            this.$refs.chefsTable.bodyWrapper.scrollLeft = 0;
            this.$refs.chefsTable.doLayout();
          });
        } else if (val == 3) {
          if (this.equips.length == 0) {
            this.initEquip();
          }
          this.$nextTick(()=>{
            this.$refs.equipsTable.bodyWrapper.scrollTop = 0;
            this.$refs.equipsTable.bodyWrapper.scrollLeft = 0;
            this.$refs.equipsTable.doLayout();
          });
        } else if (val == 4) {
          if (this.decorations.length == 0) {
            this.initDecoration();
          }
          this.$nextTick(()=>{
            this.$refs.decorationsTable.bodyWrapper.scrollTop = 0;
            this.$refs.decorationsTable.bodyWrapper.scrollLeft = 0;
            this.$refs.decorationsTable.doLayout();
          });
        } else if (val === 5) {
          if (this.maps.length === 0) {
            this.initMap();
          }
        } else if (val === 6) {
          if (this.questsMain.length == 0) {
            this.initQuests();
          }
        } else if (val === 7) {
          if (this.calChefs_list.length == 0) {
            this.tabBox = true;
            this.initCal();
          }
        }
      }
    }
  });
});
