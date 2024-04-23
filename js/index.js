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
        <div class="controll-box" v-show="!simple">
          <i class="el-input__icon el-icon-error clear" @click="clearKeyword"></i>
          <input v-model="keyword" placeholder="查找" @focus="handlerFocus"/>
          <span class="btn" @click="clear" v-if="canEmpty">清空</span>
        </div>
        <ul class="dropdown-list">
          <li
            v-for="item in f_option"
            @click="checkOption(item.id, item.name)"
            :class="(valueId.indexOf(item.id) > -1 ? 'active' : disableClass(item.id)) + ' ' + ((item.isf || item.unknowBuff) ? 'red' : '')"
          >
            <span>{{item.name}}</span>
            <span class="sub-name" v-if="item.subName">{{item.subName}}</span>
          </li>
        </ul>
        <p class="empty" v-show="f_option.length == 0">无匹配数据</p>
      </div>
    <div>
    `,
    props: ['option', 'placeholder', 'value', 'max', 'empty', 'disable', 'simple'],
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
        const keyword = this.keyword.split(' ');
        this.f_option = this.option.filter(item => {
          for (const k of keyword) {
            if (k && item.name.indexOf(k) < 0) return false;
          }
          return true;
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
        if ((!this.$refs.mutiSelect || !this.$refs.mutiSelect.contains(e.target)) && this.fold) {
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
        const keyword = val.split(' ');
        this.f_option = this.option.filter(item => {
          for (const k of keyword) {
            const rst = item.name.indexOf(k) > -1 || (item.subName && item.subName.indexOf(k) > -1);
            if (!rst) return false;
          }
          return true;
        });
      },
      show(val) {
        if (val) {
          this.keyword = "";
          if (this.$listeners['click']) this.$emit('click');
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
      url: 'https://bcjh.xyz/api',
      // url: 'http://127.0.0.1:7001',
      cloudIdShow: '',
      count: 0,
      host: window.location.host,
      location: window.location.origin + window.location.pathname,
      leftBar: false,
      rightBar: false,
      hideSuspend: false,
      settingVisible: false,
      loading: true,
      tabBox: false,
      showBack: false,
      calLoad: true,
      calLoading: false,
      calHidden: true,
      chefGotChange: false,
      repGotChange: false,
      showDetail: false,
      time1: 1,
      time2: 2,
      repGot: {},
      chefGot: {},
      custom_rule_id: null,
      customRules: {},
      customRule: null,
      onSiteChef: [], // 在场厨师id列表
      reg: new RegExp( '<br>' , "g" ),
      nav_list: [
        { id: 0, name: '首页' },
        { id: 1, name: '菜谱' },
        { id: 7, name: '计算器' },
        { id: 2, name: '厨师' },
        { id: 3, name: '厨具' },
        { id: 12, name: '遗玉' },
        { id: 4, name: '装修' },
        { id: 5, name: '采集' },
        { id: 10, name: '调料' },
        { id: 6, name: '任务' },
      ],
      page_list: [
        { id: 5, name: '5条/页' },
        { id: 10, name: '10条/页' },
        { id: 20, name: '20条/页' },
        { id: 50, name: '50条/页' },
        { id: 100, name: '100条/页' },
        { id: 1000, name: '所有' },
      ],
      chef_skill_gap_list: [
        { id: 2, name: '优级能力差' },
        { id: 3, name: '特级能力差' },
        { id: 4, name: '神级能力差' },
        { id: 5, name: '传级能力差' },
      ],
      gap_list: [
        { id: 1, name: '可级' },
        { id: 2, name: '优级' },
        { id: 3, name: '特级' },
        { id: 4, name: '神级' },
        { id: 5, name: '传级' },
      ],
      exGap: { id: [], row: [] },
      chefs_task_list: [],
      skill_map: {
        stirfry: '炒',
        boil: '煮',
        knife: '切',
        fry: '炸',
        bake: '烤',
        steam: '蒸'
      },
      grade_buff: {
        1: 0,
        2: 10,
        3: 30,
        4: 50,
        5: 100,
      },
      condimentMap: {
        Sweet: '甜',
        Sour: '酸',
        Spicy: '辣',
        Salty: '咸',
        Bitter: '苦',
        Tasty: '鲜',
      },
      materialTypeMap: {
        vegetable: '菜',
        meat: '肉',
        creation: '面',
        fish: '鱼',
      },
      userData: null,
      nav: [
        { id: 1, name: '菜谱', icon: 'el-icon-food' },
        { id: 2, name: '厨师', icon: 'el-icon-user' },
        { id: 3, name: '厨具', icon: 'el-icon-knife-fork' },
        { id: 12, name: '遗玉', icon: 'el-icon-bangzhu' },
        { id: 4, name: '装修', icon: 'el-icon-refrigerator' },
        { id: 5, name: '采集', icon: 'el-icon-chicken' },
        { id: 10, name: '调料', icon: 'el-icon-ice-tea' },
        { id: 6, name: '任务', icon: 'el-icon-document' },
        { id: 7, name: '计算器', icon: 'el-icon-set-up' },
        { id: 8, name: '个人', icon: 'el-icon-user' },
        { id: 11, name: '宴会跑分', icon: 'el-icon-cpu' },
        { id: 9, name: '说明', icon: 'el-icon-info' },
      ],
      navId: 0,
      userNav: 0,
      calCode: 'cal',
      defaultEx: false,
      defaultDiskMax: false,
      hiddenDisk: false,
      calShowGot: false,
      tableHeight: window.innerHeight - 122,
      tableShow: false,
      boxHeight: window.innerHeight - 50,
      chartHeight: window.innerHeight - 390,
      chartWidth: window.innerWidth,
      extraHeight: 0,
      data: [],
      materials_list: [],
      combos_list: [],
      combo_map: { combo: {}, split: {} },
      invitation_guest_list: [],
      chefs_list: [],
      chef_partial_skill_list: [],
      refreshFlag: false,
      partial_skill_list: [],
      self_skill_list: [],
      reps_list: [],
      userDataText: '',
      LDataText: '',
      userDataCode: '',
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
      userUltimateLast: {},
      allUltimate: {
      },
      sort: {
        rep: {},
        calRep: {
          prop: 'price_total',
          order: 'descending'
        },
        chef: {},
        equip: {},
        amber: {},
        condiment: {},
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
        skills_sim: false,
        condiment: false,
        materials: false,
        price: true,
        exPrice: false,
        time: true,
        limit: false,
        total_price: false,
        total_time_show: false,
        gold_eff: true,
        material_eff: false,
        condi_eff: false,
        origin: true,
        unlock: false,
        combo: false,
        guests: false,
        invitation_guests: false,
        degree_guests: false,
        gift: false,
        got: false
      },
      repColName: {
        id: '编号',
        img: '图',
        rarity: '星级',
        skills: '技法（全）',
        skills_sim: '技法（简）',
        condiment: '调料',
        materials: '材料',
        price: '单价',
        exPrice: '熟练售价',
        time: '单时间',
        limit: '一组',
        total_price: '总价',
        total_time_show: '总时间',
        gold_eff: '金币效率',
        material_eff: '总耗材效率',
        condi_eff: '耗调料效率',
        origin: '来源',
        unlock: '解锁',
        combo: '合成',
        guests: '贵客',
        invitation_guests: '宴会贵客',
        degree_guests: '升阶贵客',
        gift: '神级符文',
        got: '已有',
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
        condiment: {
          Sweet: { name: '甜', flag: true },
          Sour: { name: '酸', flag: true },
          Spicy: { name: '辣', flag: true },
          Salty: { name: '咸', flag: true },
          Bitter: { name: '苦', flag: true },
          Tasty: { name: '鲜', flag: true },
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
        comboRep: {},
        invitation: false,
        invitationGuest: {},
        price: '',
        materialEff: {},
        got: false
      },
      allEx: false,
      repChef: { id: [], row: [] },
      repChefTask: { id: [], row: [] },
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
      condiment_radio: false,
      skill_type: false,
      repKeyword: '',
      guestKeyword: '',
      repSkillGap: true,
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
        condiment: false,
        sex: false,
        origin: true,
        ultimateGoal: false,
        ultimateSkill: false,
        got: false
      },
      chefColName: {
        id: '编号',
        img: '图',
        rarity: '星',
        skills: '技法',
        skill: '技能',
        gather: '采集',
        condiment: '调料',
        sex: '性别',
        origin: '来源',
        ultimateGoal: '修炼任务',
        ultimateSkill: '修炼技能',
        got: '已有'
      },
      chefFilter: {
        chefKeyword: '',
        condiment_radio: false,
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
        condiment: {
          sweet: { name: '甜', flag: true },
          sour: { name: '酸', flag: true },
          spicy: { name: '辣', flag: true },
          salty: { name: '咸', flag: true },
          bitter: { name: '苦', flag: true },
          tasty: { name: '鲜', flag: true },
        },
        sex: {
          male: { name: '男', flag: true },
          female: { name: '女', flag: true },
          other: { name: '未知', flag: true }
        },
        got: false
      },
      partial_skill: { id: [], row: [] },
      chefSkillGap: { id: [], row: [] },
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
          UseSweet: { name: '甜售价', flag: true },
          UseSour: { name: '酸售价', flag: true },
          UseSpicy: { name: '辣售价', flag: true },
          UseSalty: { name: '咸售价', flag: true },
          UseBitter: { name: '苦售价', flag: true },
          UseTasty: { name: '鲜售价', flag: true },
          Sweet: { name: '甜技法', flag: true },
          Sour: { name: '酸技法', flag: true },
          Spicy: { name: '辣技法', flag: true },
          Salty: { name: '咸技法', flag: true },
          Bitter: { name: '苦技法', flag: true },
          Tasty: { name: '鲜技法', flag: true },
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
      ambers: [],
      ambersPage: [],
      amberCol: {
        id: false,
        img: false,
        rarity: true,
        color: false,
        skill: true,
        amplification: true,
        skillDetail: false,
        origin: false
      },
      amberColName: {
        id: '编号',
        img: '图',
        rarity: '星',
        color: '颜色',
        skill: '技能',
        amplification: '成长',
        skillDetail: '详细技能',
        origin: '来源'
      },
      amberFilter: {
        amberKeyword: '',
        rarity: {
          1: true,
          2: true,
          3: true
        },
        origin: {
          1: { name: '太初赤玉', flag: true },
          2: { name: '太初碧玉', flag: true },
          3: { name: '太初青玉', flag: true }
        },
        skillType: [
          {
            UseStirfry: { name: '炒售价', flag: true },
            UseBoil: { name: '煮售价', flag: true },
            UseKnife: { name: '切售价', flag: true },
            UseFry: { name: '炸售价', flag: true },
            UseBake: { name: '烤售价', flag: true },
            UseSteam: { name: '蒸售价', flag: true }
          },
          {
            Stirfry: { name: '炒技法', flag: true },
            Boil: { name: '煮技法', flag: true },
            Knife: { name: '切技法', flag: true },
            Fry: { name: '炸技法', flag: true },
            Bake: { name: '烤技法', flag: true },
            Steam: { name: '蒸技法', flag: true }
          },
          {
            GuestApearRate: { name: '贵客概率', flag: true },
            InvitationApearRate: { name: '江湖帖概率', flag: true },
          },
          {
            Meat: { name: '肉采集', flag: true },
            Creation: { name: '面采集', flag: true },
            Vegetable: { name: '菜采集', flag: true },
            Fish: { name: '鱼采集', flag: true },
          },
          {
            Material_Meat: { name: '肉类素材', flag: true },
            Material_Creation: { name: '面类素材', flag: true },
            Material_Vegetable: { name: '菜类素材', flag: true },
            Material_Fish: { name: '鱼类素材', flag: true },
          },
          {
            Sweet: { name: '甜技法', flag: true },
            Sour: { name: '酸技法', flag: true },
            Spicy: { name: '辣技法', flag: true },
            Salty: { name: '咸技法', flag: true },
            Bitter: { name: '苦技法', flag: true },
            Tasty: { name: '鲜技法', flag: true }
          },
          {
            UseSweet: { name: '甜售价', flag: true },
            UseSour: { name: '酸售价', flag: true },
            UseSpicy: { name: '辣售价', flag: true },
            UseSalty: { name: '咸售价', flag: true },
            UseBitter: { name: '苦售价', flag: true },
            UseTasty: { name: '鲜售价', flag: true }
          },
          {
            MaxEquipLimit1: { name: '1火上限', flag: true },
            MaxEquipLimit2: { name: '2火上限', flag: true },
            MaxEquipLimit3: { name: '3火上限', flag: true },
            MaxEquipLimit4: { name: '4火上限', flag: true },
            MaxEquipLimit5: { name: '5火上限', flag: true }
          },
          {
            CookbookPrice1: { name: '1火售价', flag: true },
            CookbookPrice2: { name: '2火售价', flag: true },
            CookbookPrice3: { name: '3火售价', flag: true },
            CookbookPrice4: { name: '4火售价', flag: true },
            CookbookPrice5: { name: '5火售价', flag: true }
          }
        ]
      },
      amber_radio: false,
      originAmberFilter: {},
      ambersCurPage: 1,
      ambersPageSize: 20,
      condiments: [],
      condimentsPage: [],
      condimentCol: {
        id: false,
        img: false,
        rarity: true,
        skill: true,
        origin: true
      },
      condimentColName: {
        id: '编号',
        img: '图',
        rarity: '星',
        skill: '技能',
        origin: '来源'
      },
      condimentFilter: {
        condimentKeyword: '',
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
          UseSweet: { name: '甜售价', flag: true },
          UseSour: { name: '酸售价', flag: true },
          UseSpicy: { name: '辣售价', flag: true },
          UseSalty: { name: '咸售价', flag: true },
          UseBitter: { name: '苦售价', flag: true },
          UseTasty: { name: '鲜售价', flag: true },
        }
      },
      condiment_concurrent: false,
      condiment_radio: false,
      originCondimentFilter: {},
      condimentsCurPage: 1,
      condimentsPageSize: 20,
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
        ],
        time: { id: [], row: [] },
      },
      decoration_radio: false,
      originEquipFilter: {},
      decorationsCurPage: 1,
      decorationsPageSize: 20,
      decoSelect: [],
      decoSelectId: [],
      decoBuff: '',
      decoTime_list: [],
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
        vip: false,
        cnt: '',
        skill: ''
      },
      questsType: 1,
      questsTypes: [{
        value: 1,
        label: '主线任务'
      }, {
        value: 2,
        label: '旧支线任务'
      }, {
        value: 3,
        label: '新支线任务'
      }],
      questsKeyword: '',
      questsMain: [],
      questsPage: [],
      questsRegional: [],
      questsRegionalNew: [],
      questsCurPage: 1,
      questsPageSize: 20,
      calType: { id: [], row: [] },
      rules: [],
      decoBuffValue: '',
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
      calCondiment: {
        1: { id: [], row: [] },
        2: { id: [], row: [] },
        3: { id: [], row: [] }
      },
      onSiteEffect: {
        1: [],
        2: [],
        3: [],
      },
      onSiteEffectLast: {
        1: [],
        2: [],
        3: [],
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
      calRepCnt: { // 数量
        '1-1': null,
        '1-2': null,
        '1-3': null,
        '2-1': null,
        '2-2': null,
        '2-3': null,
        '3-1': null,
        '3-2': null,
        '3-3': null,
      },
      repCntMap: {}, // 菜谱位置map，id对位置
      calRepEx: { // 专精
        '1-1': false,
        '1-2': false,
        '1-3': false,
        '2-1': false,
        '2-2': false,
        '2-3': false,
        '3-1': false,
        '3-2': false,
        '3-3': false,
      },
      calRepCondi: { // 加料
        '1-1': true,
        '1-2': true,
        '1-3': true,
        '2-1': true,
        '2-2': true,
        '2-3': true,
        '3-1': true,
        '3-2': true,
        '3-3': true,
      },
      calRepShow: [[], [], []],
      calChefShowLast: {
        1: {},
        2: {},
        3: {}
      },
      lastBuffTime: 100,
      calFocus: null,
      calChefs_origin: [],
      calChefs_list: [],
      calChefs: {
        1: [],
        2: [],
        3: [],
      },
      calEquips_list: [],
      calEquips: {
        1: [],
        2: [],
        3: [],
      },
      rep_equips_list: [],
      repChefEquip: { id: [], row: [] },
      calCondiments_list: [],
      calCondiments: {
        1: [],
        2: [],
        3: [],
      },
      calReps_list: {
        1: [],
        2: [],
        3: []
      },
      calReps_origin: {
        1: [],
        2: [],
        3: []
      },
      calRepCol: {
        id: false,
        rarity: false,
        skills_sim: false,
        skills: false,
        materials: false,
        origin: false,
        limit: true,
        price: true,
        buff_rule: true,
        price_rule: false,
        price_total: true,
        total_time_show: false,
        gold_eff: false,
      },
      calRepColName: {
        id: '编号',
        rarity: '星',
        skills_sim: '技法（简）',
        skills: '技法（全）',
        materials: '材料',
        origin: '来源',
        limit: '份数',
        price: '单价',
        buff_rule: '规则加成',
        price_rule: '规则分',
        price_total: '总得分',
        total_time_show: '总时间',
        gold_eff: '效率',
      },
      calKeyword: '',
      calReps: [],
      calRepsAll: [],
      calRepsPage: [],
      calRepsCurPage: 1,
      calRepsPageSize: 20,
      calSort: 1,
      calSort_list: [
        { id: 1, name: '分数降序' },
        { id: 2, name: '时间升序' },
        { id: 3, name: '时间降序' },
        { id: 4, name: '效率降序' }
      ],
      calSortMap: {
        1: {
          chef: { prop: 'price_chef_${i}', order: 'descending' },
          normal: { prop: 'price_total', order: 'descending' },
        },
        2: {
          chef: { prop: 'time_last', show: 'time_show', order: 'ascending' },
          normal: { prop: 'time_last', show: 'time_show', order: 'ascending' },
        },
        3: {
          chef: { prop: 'time_last', show: 'time_show', order: 'descending' },
          normal: { prop: 'time_last', show: 'time_show', order: 'descending' },
        },
        4: {
          chef: { prop: 'gold_eff_chef_${i}', order: 'descending' },
          normal: { prop: 'gold_eff', order: 'descending' },
        }
      },
      // 计算器中三个分类的遗玉列表的初始数据
      calAmberOrigin1: [],
      calAmberOrigin2: [],
      calAmberOrigin3: [],
      // 计算器中三个位置的遗玉下拉框列表
      calAmberList: {
        1: [],
        2: [],
        3: []
      },
      // 计算器中3个位置的遗玉
      calAmber: {
        1: [],
        2: [],
        3: []
      },
      // 计算器中3个位置的心法盘等级与等级上限
      calDiskLevel: {
        1: { max: 1, current: 1, last: 1 },
        2: { max: 1, current: 1, last: 1 },
        3: { max: 1, current: 1, last: 1 }
      },
      lastCalChef: {
        1: 0,
        2: 0,
        3: 0
      },
      lastCalAmber: {
        1: [],
        2: [],
        3: []
      },
      ChefNumLimit: 3,
      isOriginHei: true,
      screenHeight:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,
      originHeight:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,
      foodgodRule: [],
      materialsAll: {},
      materialsRemain: {},
      calRepLimit: {},
      ulti: {
        decoBuff: 0,
        Stirfry: 0,
        Boil: 0,
        Knife: 0,
        Fry: 0,
        Bake: 0,
        Steam: 0,
        Male: 0,
        Female: 0,
        All: 0,
        Partial: { id: [], row: [] },
        Self: { id: [], row: [] },
        MaxLimit_1: 0,
        MaxLimit_2: 0,
        MaxLimit_3: 0,
        MaxLimit_4: 0,
        MaxLimit_5: 0,
        PriceBuff_1: 0,
        PriceBuff_2: 0,
        PriceBuff_3: 0,
        PriceBuff_4: 0,
        PriceBuff_5: 0,
      },
      calChefShow: {},
      lineTips: 0,
      lastCalResultTotal: 0,
      hiddenMessage: false,
      oldCalRep: {
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
      etcRules: [],
      etcRule: { id: [], row: [] },
      planList: [],
      planListShow: false,
      customRuleShow: false,
      customRuleChange: false,
      showSort: false,
      showDel: false,
      rarityExCfg: {
        1: { x: 59.23, y: 0.36 },
        2: { x: 59.23, y: 0.31 },
        3: { x: 62.21, y: 0.26 },
        4: { x: 83.65, y: 0.21 },
        5: { x: 177.86, y: 0.16 },
      }
    },
    computed: {
      showCondiment() {
        let result = false;
        for (let i = 1; i < 4; i++) {
          if (this.calChef[i] && this.calCondiment[i] && this.calChef[i].row[0] && this.calCondiment[i].row[0]) result = true;
        }
        return result;
      },
      condiCnt() {
        const cnt = {
          1: 0,
          2: 0,
          3: 0
        };
        for (const k in cnt) {
          for (let i = 1; i < 4; i++) {
            const key = `${k}-${i}`;
            if (this.calRep[key].row[0] && this.calRepCondi[key]) {
              cnt[k] += this.calRep[key].row[0].rarity * this.calRepCnt[key];
            }
          }
        }
        return cnt
      },
      skillWidth() {
        return (this.showLastSkill || !this.chefUltimate) ? 48 : 68;
      },
      tips() {
        const names = this.partial_skill.row.map(row => row.name);
        return `${names.join(' ')} 上场技能开`;
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
        // let rst = { own: [], combo: [], split: [] };
        let disable = [];
        for (let key in this.calRep) {
          if (this.calRep[key].id.length > 0) { // 已选菜谱
            // const rep = this.calRep[key].row[0];
            const id = this.calRep[key].id[0];
            // rst.own.push(id); // 已选菜谱禁选
            disable.push(id); // 已选菜谱禁选
            // if (this.combo_map.combo[id]) { // 合成菜谱
            //   for (const rep_id of this.combo_map.combo[id]) {
            //     if (this.combo_map.split[rep_id].length == 1) { // 如果只能合成这一个，禁选
            //       // rst.combo.push({ rep_id, rep_name: rep.name_show });
            //       disable.push(rep_id);
            //     }
            //   }
            // }
            // if (this.combo_map.split[id]) { // 拆分菜谱
            //   if (this.combo_map.split[id].length == 1) {
            //     // rst.split.push({
            //     //   rep_id: this.combo_map.split[id][0],
            //     //   rep_name: rep.name_show
            //     // });
            //     disable.push(this.combo_map.split[id][0]);
            //   }
            // }
          }
        }
        return disable;
      },
      buffTips() {
        let raritys = [];
        for (let arr of this.calRepShow) {
          for (let item of arr) {
            if (item.price_total) {
              raritys.push(item.rarity);
            }
          }
        }
        raritys = Array.from(new Set(raritys));
        raritys.sort();
        let rarity_buff = [];
        raritys.forEach(r => {
          if (this.userUltimate[`PriceBuff_${r}`]) {
            rarity_buff.push(`${r}星${this.userUltimate[`PriceBuff_${r}`]}%`);
          }
        });
        let rst = `当前使用菜谱售价修炼加成：${rarity_buff.length > 0 ? rarity_buff.join(' ') : '无'}`;
        if (this.calType.id[0] == 0) { // 正常营业，加上装饰
          rst += `，当前装饰加成：${this.userUltimate.decoBuff || 0}%`
        }
        return rst;
      },
      calResultTotal() {
        if (!this.calLoad) {
          let price = 0;
          let price_origin = 0;
          let price_rule = 0;
          let time = 0;
          let time_last = 0;
          let time_buff = 100;
          const rule = this.calType.row[0];
          for (let arr of this.calRepShow) {
            for (let item of arr) {
              if (rule.ScoreCoef && typeof rule.ScoreCoef == 'object' && rule.ScoreCoef.each) {
                let str = rule.ScoreCoef.each;
                str = str.replace(new RegExp('this', 'g'), item.price_total || 0)
                price += eval(str);
              } else {
                price += item.price_total || 0;
              }
              price_origin += item.price_origin_total || 0;
              time += item.time || 0;
              price_rule += item.price_rule || 0;
              item.time_buff ? (time_buff = item.time_buff) : null;
            }
          }
          if (rule.ScoreCoef && typeof rule.ScoreCoef == 'number') {
            if (price >= 0) {
              price = Math.floor(price / this.calType.row[0].ScoreCoef);
            } else {
              price = Math.ceil(price / this.calType.row[0].ScoreCoef);
            }
          }
          if (rule.ScoreCoef && typeof rule.ScoreCoef == 'object' && rule.ScoreCoef.total) {
            let str = rule.ScoreCoef.total;
            str = str.replace(new RegExp('this', 'g'), price);
            price = eval(str);
          }
          time_last = Math.ceil((time * time_buff * 100) / 10000);
          let rule_show = price_rule ? ` 规则分：${price_rule}` : '';
          let rst = `原售价：${price_origin}${rule_show} 总得分：${price}`;

          if (this.calType.row[0].PassLine && price) { // 如果有分数线
            function getGrade(line, score) {
              for (let i = 0; i < line.length; i++) {
                if (score >= line[i]) {
                  return i;
                }
              }
              return line.length;
            }
            let passLine = this.calType.row[0].PassLine;
            let tips = ['高保', '中保', '低保', '分享保'];
            if (passLine.length == 1) {
              tips = ['过线', '未过线'];
            }
            let index = getGrade(passLine, price);
            tips = tips.slice(index)[0];
            this.lineTips = tips;
          } else {
            this.lineTips = '';
          }

          if (this.calType.id[0] == 0) {
            let gold_eff = time_last == 0 ? 0 : Math.round(price * 3600 / time_last);
            rst += `${time == time_last ? '' : ` 原时间：${this.formatTime(time)}`} 总时间：${this.formatTime(time_last)} 总效率：${gold_eff}金币/h`;
          }
          this.lastCalResultTotal = rst;
          return rst;
        } else {
          return this.lastCalResultTotal;
        }
      },
    },
    mounted() {
      if (this.getUrlKey('time')) this.navId = 7
      this.loadFoodGodRule();
      this.getVersion();
      this.getUserData();
      const arr = ['Rep', 'Chef', 'Equip', 'Amber', 'Decoration'];
      for (const key of arr) {
        this[`origin${key}Filter`] = JSON.parse(JSON.stringify(this[`${key.toLowerCase()}Filter`]));
      }
      this.getCloudId();
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
      share() {},
      getCloudId() {
        let cloud = localStorage.getItem("cloudId");
        if (cloud) {
          cloud = JSON.parse(cloud);
          let time = new Date().valueOf() - new Date(cloud.time).valueOf();
          this.cloudIdShow = time < 8640000 ? `本机上次上传个人数据ID：${cloud.id}` : '';
        }
      },
      saveNewPlan() {
        const data = this.savePlan();
        if (data) {
          this.$prompt('在下面填上方案名~', '(￣▽￣)"', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^.{1,15}$/,
            inputErrorMessage: '方案名字数在1~15个之间'
          }).then(({ value }) => {
            value = value.trim();
            const planNames = this.planList.map(p => {
              return p.name;
            });
            const index = planNames.indexOf(value);
            if (index > -1) {
              this.$confirm('已有同名方案，是否替换？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                this.planList[index] = {
                  name: value,
                  data,
                };
              }).catch(() => { });
            } else {
              this.planList.push({
                name: value,
                data,
              });
            }
          }).catch(() => {});
        }
      },
      savePlan() {
        const that = this;
        const plan_data = {};
        let has_chef = false;
        let has_rep = false;
        function saveChose(name) { // 保存选的厨师等
          plan_data[name] = {};
          for (let key in that[`cal${name}`]) { // 天啊，我怎么能写出这么丑的东西
            const item = that[`cal${name}`][key];
            if (item.id.length > 0) {
              plan_data[name][key] = item.id[0];
              if (name == 'Chef') has_chef = true;
              if (name == 'Rep') has_rep = true;
            }
          }
        }
        function saveRepEx(name, rep) { // 保存菜谱数量/专精/是否加料，name：参数名；rep：已选菜谱
          plan_data[name] = {};
          for (let key in rep) {
            const item = that[`calRep${name}`][key];
            plan_data[name][key] = item;
          }
        }
        const choseName = ['Chef', 'Equip', 'Condiment', 'Rep'];
        const repExName = ['Cnt', 'Ex', 'Condi'];
        choseName.forEach(i => {
          saveChose(i);
        });
        repExName.forEach(i => {
          saveRepEx(i, plan_data.Rep);
        });
        plan_data.Amber = {};
        plan_data.DiskLevel = {};
        // 有厨子的才保存遗玉相关
        for (let key in plan_data.Chef) {
          plan_data.Amber[key] = [];
          for (let amber of that.calAmber[key]) {
            if (amber && amber.id[0]) {
              plan_data.Amber[key].push(amber.id[0]);
            }
          }
          plan_data.DiskLevel[key] = that.calDiskLevel[key].current;
        }
        if (!has_chef && !has_rep) {
          this.$message({
            message: '至少选一个厨子或者菜谱再保存方案啊',
            showClose: true,
            type: 'warning'
          });
          return false;
        }
        return plan_data;
      },
      setPlan(data) {
        const that = this;
        that.calLoading = true;
        let amberMap = {};
        for (let amber of that.data.ambers) {
          amberMap[amber.id] = amber;
        }
        this.calClearSelect();
        this.calClear();
        this.$nextTick(()=>{
          const choseName = ['Chef', 'Equip', 'Condiment'];
          const repExName = ['Cnt', 'Ex', 'Condi'];
          const temp = {};
          choseName.forEach(i => {
            temp[i] = Object.assign({}, that[`cal${i}`]);
            for (let key in data[i]) {
              temp[i][key] = {
                id: [data[i][key]],
                row: that[`cal${i}s`][key].filter(c => {
                  return c.id == data[i][key];
                }),
              };
            }
            that[`cal${i}`] = temp[i];
          });
          // 重设心法盘
          for (let i = 1; i <= 3; i++) {
            that.setDiskList(i);
          }
          if (data.DiskLevel) {
            // 设置心法盘等级
            for (let key in data.DiskLevel) {
              that.calDiskLevel[key].current = data.DiskLevel[key];
              that.handleDiskLevelChange(key);
            }
          }
          if (data.Amber) {
            // 安装遗玉（为防止错误，有厨子才安）
            for (let key in data.Chef) {
              let amberIds = deepCopy(data.Amber[key]);
              let ambers = [];
              // 厨子的心法盘类型
              let diskInfo = that.calChef[key].row[0].disk.info;
              diskInfo.forEach((type, idx) => {
                for (let i = 0; i < amberIds.length; i++) {
                  let id = amberIds[i];
                  // 找到颜色对应的插入并从待选列表中删除
                  if (amberMap[id].type == type) {
                    ambers[idx] = {
                      id: [id],
                      row: amberMap[id]
                    }
                    amberIds.splice(i, i+1);
                    continue;
                  }
                }
              });
              that.calAmber[key] = ambers;
            }
          }
          for (let key in data.Rep) {
            that.calRep[key] = {
              id: [data.Rep[key]],
              row: that.calReps_list[key.split('-')[0]].filter(c => {
                return c.id == data.Rep[key];
              }),
            };
          }
          repExName.forEach(i => {
            temp[i] = Object.assign({}, that[`calRep${i}`]);
            for (let key in data[i]) {
              temp[i][key] = data[i][key];
            }
            that[`calRep${i}`] = temp[i];
          });
          this.$nextTick(()=>{
            // 强刷组件
            for (let key = 1; key <= 3; key++) {
              this.$refs[`calChef_${key}`][0].initOption();
              this.$refs[`calEquip_${key}`][0].initOption();
              this.$refs[`calCondiment_${key}`][0].initOption();
              for (let idx in this.calAmberList[key]) {
                this.$nextTick(()=>{
                  this.$refs[`calAmber_${key}_${idx}`][0].initOption();
                })
              }
            }
            for (let key in that.calRep) {
              this.$refs[`calRep_${key}`][0].initOption();
            }
          });
        });
        setTimeout(() => {
          that.calLoading = false;
          that.planListShow = false;
        }, 1000);
      },
      editPlanName(idx) {
        this.$prompt('在下面填上方案名~', '(￣▽￣)"', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^.{1,15}$/,
          inputErrorMessage: '方案名字数在1~15个之间',
        }).then(({ value }) => {
          value = value.trim();
          const planNames = this.planList.map(p => {
            return p.name;
          });
          const index = planNames.indexOf(value);
          if (index > -1) {
            this.$message({
              type: 'error',
              message: '方案名已经被占用了！',
              showClose: true,
            });
          } else {
            this.planList[idx].name = value;
          }
        }).catch(() => {});
      },
      replacePlan(idx) {
        const data = this.savePlan();
        if (data) {
          this.planList[idx].data = data;
          this.$message({
            type: 'success',
            message: '操作成功！',
            showClose: true,
          })
          this.planListShow = false;
        }
      },
      delPlan(idx) {
        this.planList.splice(idx, 1);
      },
      planSortUp(idx) {
        let arr = this.planList.slice();
        if (idx > 0) {
          arr.splice(idx, 1, this.planList[idx - 1]);
          arr.splice(idx - 1, 1, this.planList[idx]);
          this.planList = arr;
        }
      },
      planSortDown(idx) {
        let arr = this.planList.slice();
        if (idx < arr.length - 1) {
          arr.splice(idx, 1, this.planList[idx + 1]);
          arr.splice(idx + 1, 1, this.planList[idx]);
          this.planList = arr;
        }
      },
      getUrlKey(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ''])[1].replace(/\+/g, '%20')) || null
      },
      loadData() {
        $.ajax({
          url: './data/data.min.json?v=84'
        }).then(rst => {
          this.data = rst;
          this.initData();
        });
      },
      async loadFoodGodRule() {
        let time = this.getUrlKey('time') ? new Date(this.getUrlKey('time')) : null;
        const data = {};
        time ? data.time = JSON.parse(JSON.stringify(time)): null;
        const url = this.url;
        $.ajax({
          url: `${url}/get_rule`,
          data,
        }).then(rst => {
          if (rst) {
            if (rst.tips && (rst.is_key || !this.hiddenMessage)) {
              this.$message({
                message: rst.tips,
                showClose: true
              });
            }
            this.foodgodRule = rst.rules;
          }
          return $.ajax({
            url: `${url}/get_etc_rule`
          });
        }).then(rst => {
          this.etcRules = rst.map((r, i) => {
            return {
              id: i,
              name: r.tag,
              start_time: r.start_time
            };
          });
          this.loadData();
        }).fail(err => {
          this.$message.error('获取厨神规则失败');
          this.loadData();
        });
      },
      async getVersion() {
        const url = this.url;
        $.ajax({
          url: `${url}/get_version`,
        }).then(rst => {
          if (rst) rst = JSON.parse(rst);
          const version = localStorage.getItem('version');
          const userData = localStorage.getItem('data');
          if (userData && (!version || version != rst.version)) { // 不是第一次打开本页面
            this.$notify({
              title: '有更新！',
              message: '<strong>更新内容：</strong><br>' + rst.tips + '<br><br>如果发现未更新成功，或图片错位等情况，网页版的刷新页面，APP版的杀后台再进一次即可。',
              dangerouslyUseHTMLString: true,
              duration: 0
            });
          }
          localStorage.setItem('version', rst.version);
        }).fail(err => {
          console.log('调用获取版本号接口报错', err);
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
      changeAllEx() {
        this.saveUserData();
        if (this.repFilter.price) {
          this.initRep();
        }
      },
      initData() {
        const s = Math.pow(10, 5);
        const combo_recipes = this.data.recipes.filter(r => { return r.recipeId > 5000 });
        this.combos_list = combo_recipes.map(item => {
          item.id = item.recipeId;
          return item;
        });
        for (const i of this.data.combos) {
          this.combo_map.combo[i.recipeId] = i.recipes;
          for (const j of i.recipes) {
            if (this.combo_map.split[j]) {
              this.combo_map.split[j].push(i.recipeId);
            } else {
              this.combo_map.split[j] = [i.recipeId];
            }
          }
        }
        const invitationGuestMap = {};
        for (const guest of this.data.invitationGuests) {
          for (const gift of guest.gifts) {
            let show = `${guest.name}-${gift.gift}`
            if (invitationGuestMap[gift.recipeId]) {
              invitationGuestMap[gift.recipeId].push(show)
            } else {
              invitationGuestMap[gift.recipeId] = [show];
            }
          }
        }
        this.invitation_guest_list = this.data.invitationGuests.map(r => {
          r.id = r.name;
          return r;
        });
        this.data.recipes = this.data.recipes.map(item => {
          this.repGot[item.recipeId] = this.repGot[item.recipeId] || false;
          item.invitation_guests = invitationGuestMap[item.recipeId] ? invitationGuestMap[item.recipeId].join('\n') : '';
          item.checked = this.repGot[item.recipeId];
          item.rarity_show = '★★★★★'.slice(0, item.rarity);
          const skill_arr = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam'];
          for (let i of skill_arr) {
            item[i] = item[i] || null;
          }
          let materials_cnt = 0;
          item.materials_id = item.materials.map(m => m.material);
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
          item.condi_eff = ~~(3600 / item.time * item.rarity);
          item.total_price = item.price * item.limit;
          item.total_time = item.time * item.limit;
          item.total_time_show = this.formatTime(item.total_time);
          item.material_eff = ~~(3600 / item.time * materials_cnt);
          item.condiment_show = this.condimentMap[item.condiment];
          item.exPriceLast = item.price + item.exPrice;
          item.combo = [];
          item.comboId = [];
          for (const i of this.data.combos) {
            if (i.recipes.indexOf(item.recipeId) > -1) {
              const combo = combo_recipes.find(r => {
                return r.recipeId === i.recipeId;
              });
              item.combo.push(combo.name);
              item.comboId.push(combo.recipeId);
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
          const skill_shows = [];
          for (let key in item.skills) {
            skill_shows.push(`${this.skill_map[key]}${item.skills[key]}`);
          }
          item.skills_show = skill_shows.join(' ');
          // 专精份数时间相关
          let cfg = this.rarityExCfg[item.rarity];
          item.exCount1 = Math.ceil(cfg.x * Math.pow(item.price, cfg.y) * 10) / 10;
          // 快乐桶和蒸汽海鲜单独逻辑
          if (item.recipeId == 5001) {
            item.exCount1 = 387;
          }
          if (item.recipeId == 5002) {
            item.exCount1 = 407;
          }
          item.exCount2 = Math.ceil(item.exCount1 / 1.5 * 10) / 10;
          item.exCount3 = Math.ceil(item.exCount1 / 2 * 10) / 10;
          item.exCount4 = Math.ceil(item.exCount1 / 2.5 * 10) / 10;
          item.exCount5 = Math.ceil(item.exCount1 / 3 * 10) / 10;
          [1, 2, 3, 4, 5].forEach(i => {
            item[`exTime${i}`] = Math.ceil(item[`exCount${i}`] * item.time);
            item[`exTimeShow${i}`] = this.formatTime(item[`exTime${i}`]);
          });
          return item;
        });
        this.initRep();
        this.data.chefs = this.data.chefs.map(item => {
          this.chefGot[item.chefId] = this.chefGot[item.chefId] || false;
          item.checked = this.chefGot[item.chefId];
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
          item.sex = item.tags ? (item.tags.filter(t => new Set([1, 2]).has(t)).map(t => t == 1 ? '男' : '女').join('、')) : '';
          item.origin = item.origin.replace(this.reg, '\n');
          const ultimateGoalDetail = [];
          item.ultimateGoal = item.ultimateGoal.map(qId => {
            const quest = this.data.quests.find(q => { return q.questId == qId });
            if (quest.conditions) {
              ultimateGoalDetail.push(quest);
            }
            return quest.goal;
          }).join('\n');
          item.ultimateGoalDetail = ultimateGoalDetail;
          const ultimateSkill = this.data.skills.find(s => {
            return s.skillId === item.ultimateSkill;
          });
          item.ultimateSkillShow = ultimateSkill ? ultimateSkill.desc.replace(this.reg, '\n') : '';
          item.ultimateSkill = ultimateSkill;
          let conditions = ultimateSkill ? ultimateSkill.effect.map(e => e.condition) : [];
          conditions = Array.from(new Set(conditions)); // 去重
          item.ultimateSkillCondition = conditions.length > 0 ? conditions[0] : '';
          item.ultimateSkillConditions = conditions.length > 0 ? conditions : [];
          return item;
        });
        const rep_equips_list = [];
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
          rep_equips_list.push({
            id: item.equipId,
            name: item.name,
            subName: item.skill,
            subName_origin: item.skill,
            effect: item.effect
          });
          return item;
        });
        this.rep_equips_list = rep_equips_list;
        this.data.ambers = this.data.ambers.map(item => {
          item.rarity_show = '★★★'.slice(0, item.rarity);
          item.id = item.amberId;
          const skill = this.data.skills.filter(s => {
            return item.skill.indexOf(s.skillId) > -1;
          });
          let effect = [];
          skill.forEach(s => {
            effect = effect.concat(s.effect);
          })
          item.effect = effect;
          item.skill_list = skill;
          item.skill = skill.map(s => s.desc).join('\n').replace(this.reg, '\n');
          item.skill_detail_list = [0, 1, 2, 3, 4].map(i => {
            return item.desc.replace(new RegExp( '\_' , "g" ), skill[0].effect[0].value + i * item.amplification);
          });
          item.skill_detail = item.skill_detail_list.join('\n');
          item.subName = item.skill_detail_list[0];
          item.subName_origin = item.skill_detail_list[0];
          let skillType = [];
          for (const s of skill) {
            for (const i of s.effect) {
              if (i.type == 'CookbookPrice') {
                skillType.push(i.type + i.conditionValueList.join())
              } else if (i.type == 'MaxEquipLimit') {
                skillType.push(i.type + i.rarity)
              } else {
                skillType.push(i.type);
              }
            }
          }
          item.color = ['红', '绿', '蓝'][item.type - 1];
          item.skill_type = skillType;
          item.origin = item.origin.replace(this.reg, '\n');
          this[`calAmberOrigin${item.type}`].push(item);
          return item;
        });
        this.data.condiments = this.data.condiments.map(item => {
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
        let decoTimes = [];
        this.data.decorations = this.data.decorations.map(item => {
          item.gold_show = item.gold ? `${Math.round(item.gold * s * 100) / s}%` : null;
          item.tipMin = item.tipMin || '';
          item.tipMax = item.tipMax || '';
          if (item.tipTime) {
            decoTimes.push(Number(item.tipTime));
          }
          const dSecond = 86400;
          item.tipTime_show = this.formatTime(item.tipTime) || '';
          item.effMin = item.tipMin ? parseFloat((item.tipMin / (item.tipTime / dSecond)).toFixed(1)) : null;
          item.effMax = item.tipMax ? parseFloat((item.tipMax / (item.tipTime / dSecond)).toFixed(1)) : null;
          item.effAvg = Math.floor(((item.effMin + item.effMax) * 10 / 2)) / 10 || null;
          item.suitGold_show = item.suitGold ? `${Math.round(item.suitGold * s * 100) / s}%` : null;
          if (item.suit) {
            suits.push(item.suit);
          }
          return item;
        });
        decoTimes = Array.from(new Set(decoTimes));
        decoTimes.sort((a, b) => a - b);
        this.decoTime_list = decoTimes.map(t => {
          let name = this.formatTime(t);
          return {
            id: t,
            name
          };
        });
        this.suits = Array.from(new Set(suits));
        this.mapTypes = this.data.maps.map(item => item.name);
        const partial_skill = [];
        const chef_partial_skill = [];
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
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        this.data.chefs.forEach(item => {
          const id = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
          if (item.ultimateSkillCondition == 'Partial' || item.ultimateSkillCondition == 'Next') {
            allUltimate.Partial.id.push(id);
            allUltimate.Partial.row.push({
              id,
              name: item.name,
              subName: item.ultimateSkillShow,
              effect: item.ultimateSkill.effect,
            });
            partial_skill.push({ // 所有上场类技能
              id,
              name: item.name,
              subName: item.ultimateSkillShow,
              effect: item.ultimateSkill.effect,
            });
          }
          if (item.ultimateSkillConditions.indexOf('Partial') > -1 || item.ultimateSkillConditions.indexOf('Next') > -1) {
            const effect = item.ultimateSkill.effect.filter(e => { // 仅筛选技法光环类上场技能
              return skill_type.indexOf(e.type) > -1 && (e.condition == 'Partial' || e.condition == 'Next');
            });
            if (effect.length > 0) {
              chef_partial_skill.push({
                id,
                name: item.name,
                subName: item.ultimateSkillShow,
                effect,
              });
            }
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
          if (item.ultimateSkill && item.ultimateSkill.desc.indexOf('全技法') < 0) {
            item.ultimateSkill.effect.forEach(effect => {
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
            });
          }
          if (item.ultimateSkill && item.ultimateSkill.desc.indexOf('全技法') > -1 && item.ultimateSkill.effect[0].condition == 'Global') {
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
        this.chef_partial_skill_list = chef_partial_skill;
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
        let defaultRule = 0;
        let rules = JSON.parse(JSON.stringify(this.data.rules.filter(r => { return r.Id < 620000; })));
        if (this.foodgodRule.length > 0) {
          defaultRule = this.foodgodRule[0].Id;
          rules = this.foodgodRule.concat(rules);
        }
        this.calType.id = [defaultRule];

        this.rules = rules.map(item => {
          const arr = item.Title.split(' - ');
          if (item.Id == defaultRule) {
            this.calType.row.push(Object.assign({
              id: item.Id,
              name: arr[0],
              subName: arr[1] || ''
            }, item));
          }
          return Object.assign({
            id: item.Id,
            name: arr[0],
            subName: arr[1] || ''
          }, item);
        });
        if (this.navId == 7) {
          this.tabBox = true;
        }
        setTimeout(() => {
          this.navId = this.userNav;
          this.tableHeight = window.innerHeight - 122 - this.extraHeight;
          this.tableShow = true;
          this.loading = false;
        }, 20);
      },
      checkChefTask() {
        const repFilter = JSON.parse(JSON.stringify(this.repFilter));
        if (this.repChefTask.row && this.repChefTask.row.length == 1) {
          const { conditions, name } = this.repChefTask.row[0];
          const limit_arr = {
            1: 40,
            2: 30,
            3: 25,
            4: 20,
            5: 15,
          }; // 份数
          if (this.chefUltimate) { // 修炼开
            for (let r in limit_arr) { // 计算个人菜谱上限
              if (this.chefUseAllUltimate) { // 使用全修炼
                limit_arr[r] += this.allUltimate['MaxLimit_' + r]; // *星菜谱上限
              } else {
                limit_arr[r] += this.userUltimate['MaxLimit_' + r]; // *星菜谱上限
              }
            }
          }
          const c = conditions[0];
          if (c.rarity) { // 星级
            let max = 5;
            if (c.num && name.indexOf('一次') > -1) {
              const cnt = c.num - 2 * limit_arr[c.rarity]; // 星级菜谱最少份数
              for (let r in limit_arr) {
                if (limit_arr[r] >= cnt) {
                  max = Number(r); // 最低星级
                  continue;
                }
                break;
              }
            }
            for (let r in repFilter.rarity) {
              if (r >= c.rarity && r <= max) {
                repFilter.rarity[r] = true;
              } else {
                repFilter.rarity[r] = false;
              }
            }
          } else {
            for (let r in repFilter.rarity) {
              repFilter.rarity[r] = true;
            }
          }
          if (c.skill) { // 技法
            for (let s in repFilter.skill) {
              if (s == c.skill) {
                repFilter.skill[s].flag = true;
              } else {
                repFilter.skill[s].flag = false;
              }
            }
          } else {
            for (let s in repFilter.skill) {
              repFilter.skill[s].flag = true;
            }
          }
          if (c.anyGuest) {
            repFilter.guest = true;
          } else {
            repFilter.guest = false;
          }
          this.repFilter = repFilter;
          if (!c.anyGuest) {
            this.repSkillGap = true;
          } else {
            this.repSkillGap = false;
          }
        } else {
          this.resetTask();
        }
      },
      resetTask() {
        const repFilter = JSON.parse(JSON.stringify(this.repFilter));
        repFilter.rarity = {
          1: true,
          2: true,
          3: true,
          4: true,
          5: true
        };
        this.repSkillGap = true;
        repFilter.skill = {
          stirfry: { name: '炒', flag: true },
          boil: { name: '煮', flag: true },
          knife: { name: '切', flag: true },
          fry: { name: '炸', flag: true },
          bake: { name: '烤', flag: true },
          steam: { name: '蒸', flag: true },
        };
        repFilter.guest = false;
        this.repFilter = repFilter;
        this.skill_radio = false;
        this.skill_type = false;
        this.$refs.recipesTable.sort('time_show', null);
      },
      calClear() {
        this.calChef = {
          1: { id: [], row: [] },
          2: { id: [], row: [] },
          3: { id: [], row: [] }
        };
        this.calEquip = {
          1: { id: [], row: [] },
          2: { id: [], row: [] },
          3: { id: [], row: [] }
        };
        this.calAmber = {
          1: [],
          2: [],
          3: []
        };
        this.calCondiment = {
          1: { id: [], row: [] },
          2: { id: [], row: [] },
          3: { id: [], row: [] }
        };
        this.calRepCnt = {
          '1-1': null,
          '1-2': null,
          '1-3': null,
          '2-1': null,
          '2-2': null,
          '2-3': null,
          '3-1': null,
          '3-2': null,
          '3-3': null,
        };
        this.calRep = {
          '1-1': { id: [], row: [] },
          '1-2': { id: [], row: [] },
          '1-3': { id: [], row: [] },
          '2-1': { id: [], row: [] },
          '2-2': { id: [], row: [] },
          '2-3': { id: [], row: [] },
          '3-1': { id: [], row: [] },
          '3-2': { id: [], row: [] },
          '3-3': { id: [], row: [] },
        };
      },
      calClearSelect() {
        for (let key in this.calChef) {
          this.clearSelect(`calChef_${key}`);
        }
        for (let key in this.calEquip) {
          this.clearSelect(`calEquip_${key}`);
        }
        for (let key in this.calRep) {
          this.clearSelect(`calRep_${key}`);
        }
        for (let key in this.calCondiment) {
          this.clearSelect(`calCondiment_${key}`);
        }
        for (let key in this.calChef) {
          for (let idx in this.calAmberList[key]) {
            this.$nextTick(()=>{
              this.clearSelect(`calAmber_${key}_${idx}`);
            })
          }
        }
      },
      clearSelect(key) {
        if (this.$refs[key] && this.$refs[key][0]) {
          this.$refs[key][0].clear();
        }
      },
      initCal() {
        this.calLoading = true;
        setTimeout(() => {
          const rule = this.calType.row[0];
          if (rule.message) {
            this.$notify({
              title: '提示',
              message: rule.message,
              dangerouslyUseHTMLString: true,
              duration: 0
            });
          }
          this.ChefNumLimit = rule.ChefNumLimit || 3;
          if (!this.calHidden) {
            this.calClearSelect();
          }
          this.custom_rule_id = rule.custom_rule_id;
          const customRule = (this.customRules[rule.custom_rule_id]) || rule.CustomRule || null;
          this.customRule = JSON.parse(JSON.stringify(customRule));
          this.calClear();
          this.sort.calRep = {
            prop: 'price_total',
            order: 'descending'
          };
          if (rule.MaterialsLimit) {
            if (typeof rule.MaterialsLimit == 'object') {
              let all = {};
              for (let m of this.data.materials) {
                all[m.materialId] = rule.MaterialsLimit[m.materialId] || 0;
              }
              this.materialsAll = all;
            } else if (typeof rule.MaterialsLimit == 'number') {
              let all = {};
              for (let m of this.data.materials) {
                all[m.materialId] = rule.MaterialsLimit;
              }
              this.materialsAll = all;
            }
          }
          this.initCalChef();
          this.initCalEquip();
          this.initCalCondiment();
          this.initCalRep();
          this.calUltimateChange = false;

          let rst = {};
          for (let key in this.calRepEx) {
            rst[key] = this.defaultEx;
          }
          this.calRepEx = rst;
          this.calHidden = false;
          this.customRuleChange = false;
          this.calLoad = false;
          this.calLoading = false;
        }, 50);
      },
      initCalChef() {
        let chefs_list = [];
        const rule = this.calType.row[0];
        const diskMap = {};
        for (const disk of this.data.disks) {
          diskMap[disk.diskId] = {
            maxLevel: disk.maxLevel,
            info: disk.info
          }
        }
        for (const item of this.data.chefs) {
          const ultimateSkill = item.ultimateSkill || {};
          let tags = item.tags ? item.tags : [];
          tags = tags.filter(t => [1, 2].indexOf(t) > -1);
          let subName = '';
          let subName_origin = null;
          let chef_buff = 0;
          if (rule.ChefTagEffect) {
            for (let tag of tags) {
              chef_buff += rule.ChefTagEffect[tag];
              subName += (tag == 1 ? '男' : (tag == 2 ? '女' : ''));
            }
            subName += (' ' + (chef_buff || ''))
            subName_origin = chef_buff ? `${chef_buff}倍` : '';
          }
          let EnableChefTag = false;
          for (let tag of tags) {
            if (rule.EnableChefTags && rule.EnableChefTags.indexOf(tag) > -1) {
              EnableChefTag = true; // 性别有一个满足就可以
              break;
            }
          }
          if (!rule.EnableChefTags || EnableChefTag) {
            chefs_list.push({
              id: item.chefId,
              uid: `${item.chefId},${ultimateSkill.skillId}`,
              rarity: item.rarity,
              name: item.name,
              subName,
              subName_origin,
              isf: chef_buff < 0,
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
              disk: diskMap[item.disk],
              tags
            });
          }
        }
        chefs_list.sort((x, y) => {
          if (x.rarity < y.rarity) {
            return 1;
          } else if (x.rarity > y.rarity) {
            return -1;
          } else {
            if (x.chefId < y.chefId) {
              return 1;
            } else {
              return -1;
            }
          }
        });
        this.calChefs_origin = chefs_list;
        this.initCalChefList();
      },
      initCalChefList() {
        if (this.calShowGot) {
          this.calChefs_list = this.calChefs_origin.filter(item => {
            return this.chefGot[item.id];
          });
        } else {
          this.calChefs_list = this.calChefs_origin.slice();
        }
        this.calChefs[1] = JSON.parse(JSON.stringify(this.calChefs_list));
        this.calChefs[2] = JSON.parse(JSON.stringify(this.calChefs_list));
        this.calChefs[3] = JSON.parse(JSON.stringify(this.calChefs_list));
        this.chefGotChange = false;
      },
      initCalEquip() {
        this.calEquips_list = this.data.equips.map(item => {
          return {
            id: item.equipId,
            name: item.name,
            subName: item.skill,
            subName_origin: item.skill,
            effect: item.effect
          }
        });
        this.calEquips[1] = JSON.parse(JSON.stringify(this.calEquips_list));
        this.calEquips[2] = JSON.parse(JSON.stringify(this.calEquips_list));
        this.calEquips[3] = JSON.parse(JSON.stringify(this.calEquips_list));
      },
      initCalCondiment() {
        this.calCondiments_list = this.data.condiments.map(item => {
          return {
            id: item.condimentId,
            name: `${item.name} ${item.rarity_show}`,
            subName: item.skill,
            subName_origin: item.skill,
            effect: item.effect
          }
        });
        this.calCondiments[1] = JSON.parse(JSON.stringify(this.calCondiments_list));
        this.calCondiments[2] = JSON.parse(JSON.stringify(this.calCondiments_list));
        this.calCondiments[3] = JSON.parse(JSON.stringify(this.calCondiments_list));
      },
      initCalRep() {
        const rep = [];
        const rule = this.calType.row[0];
        let remain = {}
        if (rule.MaterialsLimit) {
          remain = JSON.parse(JSON.stringify(this.materialsAll));
          let reps = {};
          for (let key in this.calRepCnt) { // 计算食材剩余
            let i = Number(key.split('-')[0]) - 1;
            let j = Number(key.split('-')[1]) - 1;
            reps[key] = this.calRepShow[i][j];
            if (this.calRepShow[i][j] && this.calRepShow[i][j].materials && this.calRepCnt[key] > 0) {
              for (let m of this.calRepShow[i][j].materials) {
                remain[m.material] -= (m.quantity * this.calRepCnt[key]);
              }
            }
          }
        }
        const mutiEffect = {};
        if (this.customRule && this.customRule.effect) {
          const effect = this.customRule.effect;
          if (!rule.CustomMuti) { // 自定义规则加算，计入规则
            this.setCustomRule(effect, rule);
          } else { // 自定义规则乘算，计入MutiBuff
            this.setCustomRule(effect, mutiEffect);
          }
        }
        for (let item of this.data.recipes) {
          let r = {};
          r.id = item.recipeId;
          let materials = item.materials_search.split(' ');
          materials = materials.map((m, i) => {
            return Object.assign({
              name: m
            }, item.materials[i]);
          });
          r.materials = materials;
          let buff = 100;
          let ex = 0
          if (this.defaultEx) {
            ex += item.exPrice;
          }

          r.buff_ulti = this.ulti[`PriceBuff_${item.rarity}`]; // 修炼菜谱售价加成
          buff += r.buff_ulti;
          let buff_rule = 0;
          let buff_muti = 100;

          if (this.calType.id[0] == 0) { // 正常营业，加上家具加成
            r.buff_deco = this.ulti.decoBuff;
            buff += r.buff_deco;
          } else { // 菜谱/食材规则加成
            if (rule.RecipeEffect) { // 菜谱加成
              if (rule.RecipeEffect[r.id] != null) {
                buff_rule += (rule.RecipeEffect[r.id] * 100)
              } else {
                r.unknowBuff = true;
              }
              if (rule.NotSure) {
                r.NotSure = rule.NotSure.indexOf(r.id) > -1;
              }
            }
            buff_rule += this.sumBuffRule(rule, item);
            buff_muti += this.sumBuffRule(mutiEffect, item);
          }

          r.buff_rule = buff_rule;
          r.buff_muti = buff_muti;
          r.price_wipe_rule = Math.ceil(((item.price + ex) * buff) / 100);

          buff += buff_rule;
          r.price_buff = Math.ceil(((item.price + ex) * buff * buff_muti) / 10000);

          r.limit = item.limit + this.ulti[`MaxLimit_${item.rarity}`];
          if (this.customRule && this.customRule.skill && this.customRule.skill.MaxLimit) {
            r.limit += Number(this.customRule.skill.MaxLimit[item.rarity]) || 0;
          }

          r.limit_origin = r.limit;
          if (rule.DisableMultiCookbook) {
            r.limit = 1;
            r.limit_origin = 1;
          }
          r.limit_mater = 500;
          if (rule.MaterialsLimit) { // 如果限制了食材数量
            let min = 500;
            for (let m of r.materials) {
              let lim = Math.floor(remain[m.material] / m.quantity);
              min = (min < lim ? min : lim);
            }
            // 食材限制的数量
            r.limit_mater = min;
          }
          r.price_total = r.price_buff * r.limit; // 未选厨子时的总价
          r.buff = buff;

          r.buff_rule_show = r.unknowBuff ? '未知' : (buff_rule ? `${buff_rule}%` : '');
          r.price_rule = r.price_total - (r.price_wipe_rule * r.limit);

          const skills = [];
          for (let key in item.skills) {
            skills.push(`${this.skill_map[key]}${item.skills[key]}`);
          }
          r.skills_show = skills.join(' ');
          r.name = `${item.name}（${r.skills_show} [${item.condiment_show}]）`;
          let ext = {
            galleryId: item.galleryId,
            name_show: item.name,
            rarity: item.rarity,
            rarity_show: item.rarity_show,
            price: item.price,
            exPrice: item.exPrice,
            skills: item.skills,
            stirfry: item.stirfry,
            boil: item.boil,
            knife: item.knife,
            fry: item.fry,
            bake: item.bake,
            steam: item.steam,
            materials_show: item.materials_show,
            origin: item.origin,
            time: item.time,
            total_time_show: item.total_time_show,
            total_time: item.total_time,
            time_last: item.time,
            time_show: item.time_show,
            gold_eff: item.gold_eff,
            materials_type: item.materials_type,
            materials_search: item.materials_search,
            condiment: item.condiment,
            condiment_show: item.condiment_show,
            tags: item.tags,
            isCombo: Boolean(this.combo_map.combo[item.recipeId])
          };
          Object.assign(ext, r);
          if (item.rarity <= (rule.CookbookRarityLimit || 6)) {
            rep.push(ext);
          }
        }
        this.calRepsAll = rep;
        for (let key in this.calChef) {
          if (this.calChef[key].id[0]) {
            this.handlerChef(key);
          }
        }
        this.setDefaultSort();
      },
      setCustomEffect(effect) {
        let result = {};
        for (let key in effect) {
          result[key] = effect[key] ? Number((Number(effect[key]) / 100).toFixed(3)) : 0;
        }
        return result;
      },
      setCustomRule(custom, rule) {
        const prop = ['SkillEffect', 'CondimentEffect', 'MaterialTypeEffect'];
        prop.forEach(p => {
          if (custom[p]) {
            rule[p] = this.setCustomEffect(custom[p]);
          }
        });
        rule.TotalEffect = custom.TotalEffect ? Number(custom.TotalEffect) : 0;
      },
      sumBuffRule(rule, recipe) { // 计算规则加成(菜谱食材等加成)
        let buff = 0;
        if (rule.MaterialsEffect && rule.MaterialsEffect.length > 0) {
          rule.MaterialsEffect.forEach(m => {
            if (recipe.materials_id.indexOf(m.MaterialID) > -1) {
              buff += (m.Effect * 100);
            }
          });
        }
        if (rule.SkillEffect) {
          for (let skillCode in rule.SkillEffect) {
            if (recipe[skillCode]) {
              buff += Math.round((rule.SkillEffect[skillCode] || 0) * 100);
            }
          }
        }
        if (rule.RarityEffect) {
          buff += Math.round((rule.RarityEffect[recipe.rarity] || 0) * 100);
        }
        if (rule.CondimentEffect) {
          buff += Math.round((rule.CondimentEffect[recipe.condiment] || 0) * 100);
        }
        if (rule.MaterialTypeEffect) {
          for (let type in rule.MaterialTypeEffect) {
            if (recipe.materials_type.indexOf(type) > -1) {
              buff += Math.round(rule.MaterialTypeEffect[type] * 100);
            }
          }
        }
        if (rule.TotalEffect) {
          buff += rule.TotalEffect;
        }
        return buff;
      },
      getRecommend(flag, key, idx) {
        const hasRep = this.hasRep(key);
        if (flag == 'chef') { // 厨子
          if (hasRep) {
            this.getRecommendChef(key);
          } else {
            this.calChefs[key] = JSON.parse(JSON.stringify(this.calChefs_list));
          }
        }
        if (flag == 'equip') { // 厨具
          if (hasRep && this.calChef[key].id[0]) { // 厨子和菜谱都有
            this.getRecommendEqp(key);
          } else {
            this.calEquips[key] = JSON.parse(JSON.stringify(this.calEquips_list));
          }
        }
        if (flag == 'amber') {
          if (hasRep && this.calChef[key].id[0]) { // 厨子和菜谱都有
            this.getRecommendAmber(key, idx);
          } else {
            let type = this.calChef[key].row[0].disk.info[idx];
            this.calAmberList[key][idx] = deepCopy(this[`calAmberOrigin${type}`])
            // 强刷组件
            this.$nextTick(()=>{
              this.$refs[`calAmber_${key}_${idx}`][0].initOption();
            })
          }
        }
        if (flag == 'condi') {
          if (hasRep && this.calChef[key].id[0]) { // 厨子和菜谱都有
            this.getRecommendCondi(key);
          } else {
            this.calCondiments[key] = JSON.parse(JSON.stringify(this.calCondiments_list));
          }
        }
      },
      getRecommendChef(key) {
        // const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        this.calChefs[key].forEach(c => {
          let chef = this.showChef(c, key); // 获取厨师数值
          let price = 0;
          let inf = {};
          let inf_str = '';
          let inf_sum = 0;
          // let partials = [];
          for (let i of [1, 2, 3]) { // 判断是否有菜谱
            const rep = this.calRep[`${key}-${i}`].row[0];
            if (rep) {
              const cnt = this.calRepCnt[`${key}-${i}`];
              const result = this.calScore(chef, rep, 'chf', key);
              price += (result.chef_chf.price_buff * cnt);
              for (let sk in result.chef_chf.inf) {
                inf[sk] = Math.min((result.chef_chf.inf[sk] || 0), (inf[sk] || 0));
              }
            }
          }
          for (let sk in inf) {
            if (inf[sk] < 0) {
              inf_str += ` ${this.skill_map[sk]}${inf[sk]}`;
              inf_sum -= inf[sk];
            }
          }
          // if (this.ulti.Partial.id.indexOf(c.uid) > -1) { // 如果有已修炼上场类修炼技能
          //   c.ultimate_effect.forEach(eff => {
          //     if (eff.condition == 'Partial' && skill_type.indexOf(eff.type) > -1) {
          //       partials.push(`${this.skill_map[eff.type.toLowerCase()]}光环+${eff.value}`);
          //     }
          //   });
          // }
          // c.subName = (c.subName_origin || '') + ' ' + price + (inf_str ? ' ' : '') + inf_str + ' ' + partials.join(' ');
          c.subName = (c.subName_origin || '') + ' ' + price + ' ' + inf_str;
          c.price_total = price;
          c.isf = inf_str != '';
          c.inf_sum = inf_sum;
        });
        this.calChefs[key].sort(function(x, y) {
          if (y.price_total != x.price_total) {
            return y.price_total - x.price_total;
          }
          return x.inf_sum - y.inf_sum;
        });
      },
      getRecommendEqp(key) {
        const chf = JSON.parse(JSON.stringify(this.calChef[key].row[0]));
        if (!chf) return;
        this.calEquips[key].forEach(c => {
          let chef = this.showChef(chf, key, c); // 获取厨师数值
          let price = 0;
          let inf = {};
          let inf_str = '';
          let inf_sum = 0;
          for (let i of [1, 2, 3]) { // 判断是否有菜谱
            const rep = this.calRep[`${key}-${i}`].row[0];
            if (rep) {
              const cnt = this.calRepCnt[`${key}-${i}`];
              const result = this.calScore(chef, rep, 'eqp', key);
              price += (result.chef_eqp.price_buff * cnt);
              for (let sk in result.chef_eqp.inf) {
                inf[sk] = Math.min((result.chef_eqp.inf[sk] || 0), (inf[sk] || 0));
              }
            }
          }
          for (let sk in inf) {
            if (inf[sk] < 0) {
              inf_str += ` ${this.skill_map[sk]}${inf[sk]}`;
              inf_sum -= inf[sk];
            }
          }
          c.subName = ' ' + price + ' ' + inf_str + ' ' + (c.subName_origin || '');
          c.price_total = price;
          c.isf = inf_str != '';
          c.inf_sum = inf_sum;
        });
        this.calEquips[key].sort(function(x, y) {
          if (y.price_total != x.price_total) {
            return y.price_total - x.price_total;
          }
          return x.inf_sum - y.inf_sum;
        });
      },
      getRecommendAmber(key, idx) {
        const chf = deepCopy(this.calChef[key].row[0]);
        if (!chf) return;
        // 当前厨子的遗玉列表
        let ambers = this.calAmber[key].map(a => {
          if (a && a.row[0]) {
            return a.row[0];
          }
          return null;
        });
        this.calAmberList[key][idx].forEach(c => {
          ambers[idx] = c;
          let chef = this.showChef(chf, key, null, null, ambers); // 获取厨师数值
          let price = 0;
          let inf = {};
          let inf_str = '';
          let inf_sum = 0;
          for (let i of [1, 2, 3]) { // 判断是否有菜谱
            const rep = this.calRep[`${key}-${i}`].row[0];
            if (rep) {
              const cnt = this.calRepCnt[`${key}-${i}`];
              const result = this.calScore(chef, rep, 'amber', key);
              price += (result.chef_amber.price_buff * cnt);
              for (let sk in result.chef_amber.inf) {
                inf[sk] = Math.min((result.chef_amber.inf[sk] || 0), (inf[sk] || 0));
              }
            }
          }
          for (let sk in inf) {
            if (inf[sk] < 0) {
              inf_str += ` ${this.skill_map[sk]}${inf[sk]}`;
              inf_sum -= inf[sk];
            }
          }
          c.subName = ' ' + price + ' ' + inf_str + ' ' + (c.subName_origin || '');
          c.price_total = price;
          c.isf = inf_str != '';
          c.inf_sum = inf_sum;
        });
        this.calAmberList[key][idx].sort(function(x, y) {
          if (y.price_total != x.price_total) {
            return y.price_total - x.price_total;
          }
          return x.inf_sum - y.inf_sum;
        });
        // 强刷组件
        this.$nextTick(()=>{
          this.$refs[`calAmber_${key}_${idx}`][0].initOption();
        })
      },
      getRecommendCondi(key) {
        const chf = JSON.parse(JSON.stringify(this.calChef[key].row[0]));
        if (!chf) return;
        this.calCondiments[key].forEach(c => {
          let chef = this.showChef(chf, key, null, c); // 获取厨师数值
          let price = 0;
          for (let i of [1, 2, 3]) { // 判断是否有菜谱
            const rep = this.calRep[`${key}-${i}`].row[0];
            if (rep) {
              const cnt = this.calRepCnt[`${key}-${i}`];
              const result = this.calScore(chef, rep, 'cdi', key);
              price += (result.chef_cdi.price_buff * cnt);
            }
          }
          c.subName = ' ' + price + ' ' + (c.subName_origin || '');
          c.price_total = price;
        });
        this.calCondiments[key].sort(function(x, y) {
          if (y.price_total != x.price_total) {
            return y.price_total - x.price_total;
          }
          return 0;
        });
      },
      showRepCnt(cnt, lim) {
        if (lim > cnt) {
          return `${cnt}/${lim}`
        }
        return cnt;
      },
      getChefBasicBuffByRank(eff, chf, position) { // 计算厨师的场上基础售价加成
        let buff = 0;
        for (let key of [1, 2, 3]) {
          let rep = this.calRep[`${position}-${key}`].row[0];
          if (rep && this.getGrade(chf, rep).min >= eff.conditionValue) {
            buff += eff.value;
          }
        }
        return buff;
      },
      getPerRankCnt(eff, chf, position) { // 计算满足品级加成的菜谱数量
        let cnt = 0;
        for (let key of [1, 2, 3]) {
          let rep = this.calRep[`${position}-${key}`].row[0];
          if (rep && this.getGrade(chf, rep).min >= eff.conditionValue) {
            cnt += 1;
          }
        }
        return cnt;
      },
      getGrade(chf, rep) {
        let inf = [];
        let inf_detail = {};
        let min = 5;
        const rule = this.calType.row[0];
        if (rule.DisableCookbookRank) { // 无菜品加成
          min = 1;
        }
        for (let sk in rep.skills) { // 判断品级
          let multi = Math.floor(chf.skills_last[sk] / rep.skills[sk]);
          if (chf.skills_last[sk] < rep.skills[sk]) {
            inf.push(`${this.skill_map[sk]}${chf.skills_last[sk] - rep.skills[sk]}`);
            inf_detail[sk] = Math.min((inf_detail[sk] || 0), (chf.skills_last[sk] - rep.skills[sk]));
          }
          min = multi > min ? min : multi;
        }
        return {min, inf, inf_detail};
      },
      calScore(chf, rep, pos, position) { // 计算厨师做某个菜的结果
        let chef = {};
        const rule = this.calType.row[0];
        chef.buff_rule = rep.buff_rule;
        this.onSiteEffect[position] = [];

        let buff_skill = 0;
        let buff_equip = 0;
        let buff_condiment = 0;
        chef.buff = rep.buff;
        rep.basicPrice = 0;
        chef.basicPrice = 0; // 当前场上的基础售价加成

        if (rule.ChefTagEffect) { // 男厨/女厨倍数
          let tag_buff = 0;
          for (let tag of chf.tags) {
            tag_buff += rule.ChefTagEffect[tag] * 100;
          }
          chef.buff_rule += tag_buff;
          chef.buff += tag_buff;
        }

        let grade = this.getGrade(chf, rep);
        chef.grade = grade.min; // 品级
        let inf = grade.inf;
        let inf_detail = grade.inf_detail;
        chef.buff_grade = this.grade_buff[chef.grade] || 0; // 品级加成
        chef.buff += chef.buff_grade;

        let limitBuff = 0;
        chf.amber_effect.forEach(eff => { // 心法技能份数上限
          if (eff.type == 'MaxEquipLimit' && eff.rarity == rep.rarity) {
            limitBuff += eff.value;
          }
        });
        chef.limitBuff = limitBuff;
        // 规则限制
        let limitRule = rule.DisableMultiCookbook ? 1 : 500;
        // 除加成外的份数
        rep.limit = Math.min(rep.limit_origin, rep.limit_mater, limitRule);

        // 厨子加成后的份数
        let limitChef = Math.min(rep.limit_origin + limitBuff, rep.limit_mater, limitRule);
        chef.limit = limitChef;
        let repCnt = limitChef;
        if (['1', '2', '3'].indexOf(pos) > -1 && this.repCntMap[rep.id]) { // 如果不是计算预计值，且在场，使用场上份数
          repCnt = this.calRepCnt[this.repCntMap[rep.id]];
        }

        chf.amber_effect.forEach(eff => { // 心法技能
          buff_skill += this.getEffectBuff(eff, rep, chf, repCnt, chef.grade, position);
            if (eff.type == 'BasicPrice') {
              if (eff.conditionType == null) {
                chef.basicPrice += eff.value;
              } else if (eff.conditionType == 'PerRank') {
                chef.basicPrice += this.getChefBasicBuffByRank(eff, chf, position);
              }
            }
        });


        if (!rule.DisableChefSkillEffect) {
          chf.sum_skill_effect.forEach(eff => { // 技能
            if (eff.type == 'BasicPrice') {
              if (eff.conditionType == null) {
                chef.basicPrice += eff.value;
              } else if (eff.conditionType == 'PerRank') {
                chef.basicPrice += this.getChefBasicBuffByRank(eff, chf, position);
              } else {
                chef.basicPrice += this.getEffectBuff(eff, rep, chf, repCnt, chef.grade, position, 0, 1);
              }
            } else {
              buff_skill += this.getEffectBuff(eff, rep, chf, repCnt, chef.grade, position);
            }
          });
        }

        if (!rule.DisableEquipSkillEffect) {
          chf.equip_effect.forEach(eff => { // 厨具技能
            buff_equip += this.getEffectBuff(eff, rep, chf, repCnt, chef.grade, position, 1);
          });
        }

        if (!rule.DisableCondimentSkillEffect) {
          chf.condiment_effect.forEach(eff => { // 调料技能
            buff_condiment += this.getEffectBuff(eff, rep, chf, repCnt, chef.grade, position);
          });
        }
        let onSiteEffect = this.onSiteEffect[1].concat(this.onSiteEffect[2]).concat(this.onSiteEffect[3]);
        onSiteEffect.forEach(eff => { // 在场技能
          if (eff.type == 'BasicPrice') {
            chef.basicPrice += eff.value;
          } else if (eff.type.slice(0, 10) == 'BasicPrice') {
            let effNew = deepCopy(eff);
            effNew.type = eff.type.slice(10);
            chef.basicPrice += this.getEffectBuff(effNew, rep, chf, repCnt, chef.grade, position);
          } else {
            buff_skill += this.getEffectBuff(eff, rep, chf, repCnt, chef.grade, position);
          }
        });

        chef.buff_equip = buff_equip;
        chef.buff += buff_equip;
        chef.buff_skill = buff_skill;
        chef.buff += buff_skill;
        chef.buff_condiment = buff_condiment;
        chef.buff += buff_condiment;

        let ex = this.defaultEx ? rep.exPrice : 0;
        let basicBuff = rep.basicPrice + chef.basicPrice; // 基础加成
        let price = Math.floor((rep.price + ex) * (100 + basicBuff) / 100);
        chef.price_buff = Math.ceil(price * chef.buff * rep.buff_muti / 10000);
        chef.price_total = chef.price_buff * limitChef;

        chef.subName = '';
        chef.inf = {};
        if (chef.grade < 1) {
          chef.inf = inf_detail;
          chef.subName += ' ' + inf.join(' ');
        }
        if (this.calType.id[0] == 0) { // 正常营业算效率
          chef.gold_eff = Math.floor(chef.price_buff * 3600 / rep.time_last);
          rep[`gold_eff_chef_${pos}`] = chef.gold_eff;
        }

        rep[`chef_${pos}`] = chef;
        rep[`price_chef_${pos}`] = chef.price_total;
        return rep;
      },
      getSameSkillFlag(position) {
        const skill_type = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam'];
        let result = 0;
        for (let sk of skill_type) {
          let cnt = 0;
          for (let key of [1, 2, 3]) {
            let rep = this.calRep[`${position}-${key}`].row[0];
            if (rep && rep[sk]) {
              cnt ++;
            }
          }
          if (cnt == 3) {
            result ++;
          }
        }
        return result;
      },
      getEffectBuff(eff, rep, chf, repCnt, grade, position, eqpFlag = 0, basicFlag = 0) { // 根据effect和rep，获取buff数值
        let buff = 0;
        if (!eff.conditionType) { // 无前置条件
          buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
        } else if (eff.conditionType == 'ExcessCookbookNum') { // 菜谱份数大于
          if (repCnt >= eff.conditionValue) {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
          }
        } else if (eff.conditionType == 'FewerCookbookNum') { // 菜谱份数不超过
          if (repCnt <= eff.conditionValue) {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
          }
        } else if (eff.conditionType == 'PerRank') { // 每制作一种菜谱品阶
          if (eff.condition == 'Partial') {
            let effect = Object.assign({}, eff);
            delete effect.conditionType;
            delete effect.condition;
            effect.value = eff.value * this.getPerRankCnt(eff, chf, position);
            this.onSiteEffect[position].push(effect);
          } else {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag) * this.getPerRankCnt(eff, chf, position);
          }
        } else if (eff.conditionType == 'Rank') { // 菜谱品阶
          if (grade >= eff.conditionValue) {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
          }
        } else if (eff.conditionType == 'SameSkill') { // 同技法
          if (this.getSameSkillFlag(position) > 0) { // 如果同技法判定通过
            if (eff.condition == 'Partial') {
              let effect = Object.assign({}, eff);
              delete effect.conditionType;
              delete effect.condition;
              effect.value = eff.value * this.getSameSkillFlag(position);
              this.onSiteEffect[position].push(effect);
            } else {
              buff += eff.value * this.getSameSkillFlag(position);
            }
          }
        } else if (eff.conditionType == 'CookbookRarity') { // 菜谱星级
          if (eff.conditionValueList.indexOf(rep.rarity) > -1) {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
          }
        }
        else if (eff.conditionType == 'ChefTag') { // 厨师tag
          if (eff.condition == 'Partial') {
            let effect = deepCopy(eff);
            delete effect.condition;
            this.onSiteEffect[position].push(effect);
          } else if (this.checkTag(eff.conditionValueList, chf.tags)) {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
          }
        } else if (eff.conditionType == 'CookbookTag') { // 菜谱tag
          if (eff.condition == 'Partial') {
            let effect = deepCopy(eff);
            delete effect.condition;
            this.onSiteEffect[position].push(effect);
          } else if (this.checkTag(eff.conditionValueList, rep.tags)) {
            buff += this.getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag, basicFlag);
          }
        }
        return buff;
      },
      checkTag(condion, tags) {
        const chefTags = new Set(tags);
        const intersection = condion.filter(x => chefTags.has(x));
        return intersection.length > 0;
      },
      getEffectBuffWithOutCondition(eff, rep, chf, eqpFlag = 0, basicFlag = 0) { // 前置条件通过的情况，计算buff数值
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const condiment_type = ['Sweet', 'Sour', 'Spicy', 'Salty', 'Bitter', 'Tasty'];
        const material_type = ['Meat', 'Vegetable', 'Creation', 'Fish'];
        const rule = this.calType.row[0];
        let buff = 0;
        if (eff.type == 'Gold_Gain' && rule.id == 0) { // 金币加成
          buff += this.getSelfPartialBuff(eff, chf, eqpFlag);
        }
        if (eff.type.slice(0, 3) == 'Use' && skill_type.indexOf(eff.type.slice(3)) > -1) { // 技法类售价加成
          if (rep.skills[eff.type.slice(3).toLowerCase()]) {
            buff += this.getSelfPartialBuff(eff, chf, eqpFlag);
          }
        }
        if (eff.type.slice(0, 3) == 'Use' && material_type.indexOf(eff.type.slice(3)) > -1) { // 食材类售价加成
          if (rep.materials_type.indexOf(eff.type.slice(3).toLowerCase()) > -1) {
            buff += this.getSelfPartialBuff(eff, chf, eqpFlag);
          }
        }
        if (eff.type.slice(0, 3) == 'Use' && condiment_type.indexOf(eff.type.slice(3)) > -1) { // 调料类售价加成
          if (rep.condiment === eff.type.slice(3)) {
            buff += this.getSelfPartialBuff(eff, chf, eqpFlag);
          }
        }
        if (eff.type == 'CookbookPrice') { // 菜谱售价
          buff += this.getSelfPartialBuff(eff, chf, eqpFlag);
        }
        if (eff.type == 'BasicPrice' && eff.conditionType == 'PerRank') { // 基础售价
          if (!this.repCntMap[rep.id]) { // 如果不在场，加在自己上，在场的另外加
            rep.basicPrice += this.getSelfPartialBuff(eff, chf, eqpFlag);
          }
        } else if (eff.type == 'BasicPrice' && basicFlag == 1) {
          buff += this.getSelfPartialBuff(eff, chf, eqpFlag);
        }

        return buff;
      },
      getSelfPartialBuff(eff, chf, eqpFlag = 0) { // 个人，全体售价分类
        let muti = eqpFlag ? (100 + chf.MutiEquipmentSkill || 0) / 100 : 1;
        let buff = eff.value * muti;
        if (eff.condition == 'Partial' && this.onSiteChef.indexOf(chf.id) > -1) {
          return 0; // 全体，且厨师在场，前面已经记中在场buff上
        }
        return buff; // 否则加到个人上
      },
      handlerChef(i) { // 厨子变化
        let chef = this.calChefShow[i];
        const reps = this.calRepsAll.map(r => {
          return this.calScore(chef, r, i, i);
        });
        this.calRepsAll = reps;
        this.calRepSort(i);
        setTimeout(() => this.getCalRepLimit(), 100)
      },
      changeSort() {
        setTimeout(() => {
          for (let key in this.calChef) {
            if (this.calChef[key].id[0]) {
              this.handlerChef(key);
            }
          }
          this.setDefaultSort();
        }, 10);
      },
      setDefaultSort() {
        this.calRepsAll.sort(this.customSort(this.calSortMap[this.calSort].normal));
        let show = this.calSortMap[this.calSort].normal.show || this.calSortMap[this.calSort].normal.prop;
        this.calRepDefaultSort = this.calRepsAll.map(r => {
          r.subName = String(r[show]) + (r.unknowBuff ? ' 规则未知' : '') + (r.NotSure ? ' 倍数可能不对' : '');
          return r;
        });
        this.calRepSort();
      },
      calRepSort(key) { // 计算器页厨师选菜谱下拉框的排序
        if (key) {
          let list = JSON.parse(JSON.stringify(this.calRepsAll));
          let prop = this.calSortMap[this.calSort].chef.prop.replace('${i}', key);
          let order = this.calSortMap[this.calSort].chef.order;
          list.sort(this.customSort({ prop, order }));
          this.calReps_origin[key] = list.map(r => {
            let show = this.calSortMap[this.calSort].chef.show || prop;
            r.subName = r[show] + (r.unknowBuff ? ' 规则未知' : '') + (r.NotSure ? ' 倍数可能不对' : '') + String(r[`chef_${key}`].subName);
            r.isf = r[`chef_${key}`].grade < 1 ? true : false; // 是否技法不足
            return r;
          });
          this.initCalRepList(key);
        } else {
          for (let i = 1; i < 4; i++) {
            if (!this.calChef[i].id[0]) {
              this.calReps_origin[i] = deepCopy(this.calRepDefaultSort);
            }
          }
          this.initCalRepList();
        }
      },
      initCalRepList(key) {
        if (key) {
          if (this.calShowGot) {
            this.calReps_list[key] = this.calReps_origin[key].filter(item => {
              return this.repGot[item.id];
            });
          } else {
            this.calReps_list[key] = this.calReps_origin[key].slice();
          }
        } else {
          for (let i = 1; i < 4; i++) {
            if (this.calShowGot) {
              this.calReps_list[i] = this.calReps_origin[i].filter(item => {
                return this.repGot[item.id];
              });
            } else {
              this.calReps_list[i] = this.calReps_origin[i].slice();
            }
          }
        }
        this.repGotChange = false;
      },
      handleCalRepChange(row, key) {
        if (!row[0] || this.oldCalRep[key] != row[0].id || !this.oldCalRep[key]) { // 取下菜谱或更换菜谱
          let chef = this.calChef[key.slice(0, 1)].row; // 检查当前厨师
          // 如果会根据菜谱品级、同技法变化的加成
          if (chef && chef[0] && (chef[0].effect_condition.indexOf('PerRank') > -1 || chef[0].effect_condition.indexOf('SameSkill') > -1)) {
            // 如果是全场售价加成
            if (chef[0].partial_flag) {
              for (let k of [1,2,3]) {
                if (this.calChef[k].row[0]) {
                  setTimeout(() => this.handlerChef(k), 50); // 三个都需要重算
                }
              }
            } else { // 否则计算自己
              setTimeout(() => this.handlerChef(key.slice(0, 1)), 50); // 重新计算加成
            }
          }
        }
        if (!row[0]) {
          this.oldCalRep[key] = 0;
        } else if (this.oldCalRep[key] != row[0].id) {
          this.calRepCondi[key] = true;
          this.oldCalRep[key] = row[0].id;
        }
        if (this.calRepCnt[key] == null || !row[0]) {
          if (row[0]) {
            // 当前有厨师，使用厨师加成后的份数，无厨师使用初始份数
            let limit = this.calChef[key.slice(0, 1)].id[0] ? row[0][`chef_${key.slice(0, 1)}`].limit : row[0].limit;
            this.calRepCnt[key] = limit;
            this.calRepLimit[key] = this.calRepCnt[key];
          } else {
            this.calRepCnt[key] = null;
          }
        }
      },
      getCalRepLimit() {
        let lim = {}
        let calRep = this.calRep;
        const rule = this.calType.row[0];
        for (let key in calRep) {
          if (!calRep[key].id[0]) {
            lim[key] = 0
          } else {
            let rep = calRep[key].row[0];
            let chefKey = `chef_${key.slice(0, 1)}`;
            // 食材限制
            let limit_mater = 500;
            // 规则限制
            let limitRule = rule.DisableMultiCookbook ? 1 : 500;
            if (rule.MaterialsLimit) {
              let remain = JSON.parse(JSON.stringify(this.materialsAll));
              for (let k in calRep) {
                if (calRep[k].id[0] && k !== key && this.calRepCnt[k] > 0) {
                  for (let m of calRep[k].row[0].materials) {
                    remain[m.material] -= (m.quantity * this.calRepCnt[k]);
                  }
                }
              }
              for (let m of rep.materials) {
                let l = Math.floor(remain[m.material] / m.quantity);
                limit_mater = (limit_mater < l ? limit_mater : l);
              }
            }
            const limit_arr = [0, 40, 30, 25, 20, 15];
            let limit_origin = this.ulti[`MaxLimit_${rep.rarity}`] + limit_arr[rep.rarity];
            if (this.customRule && this.customRule.skill && this.customRule.skill.MaxLimit) {
              limit_origin += Number(this.customRule.skill.MaxLimit[rep.rarity]) || 0;
            }
            // 厨师的加成
            let limitBuff = rep[chefKey] ? rep[chefKey].limitBuff : 0;
            lim[key] = Math.min(limit_origin + (limitBuff || 0), limit_mater, limitRule);
          }
          if (this.calRepCnt[key] > lim[key]) {
            this.calRepCnt[key] = lim[key];
          }
        }
        this.calRepLimit = lim;
      },
      handleRepCntChange(key, limit) {
        let val = this.calRepCnt[key];
        val = val.replace(/\./g, '');
        val = val.replace(/\-/g, '');
        val = Number(val);
        val = val > limit ? limit : val;
        this.calRepCnt[key] = val;
      },
      getCalChefShow(pos) {
        const rst = {};
        if (pos != null) {
          this.calChefShow[pos] = this.calChef[pos].row[0] ? this.showChef(this.calChef[pos].row[0], pos) : {};
          return;
        }
        for (const key in this.calChef) {
          rst[key] = this.calChef[key].row[0] ? this.showChef(this.calChef[key].row[0], key) : {};
        }
        this.calChefShow = rst;
      },
      showChef(chef, position, eqp, condi, ambers) {
        let ultimate = false;
        const rule = this.calType.row[0];
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const skills_show = {};
        const skills_last = {};
        let equip_effect = [];
        let condiment_effect = [];
        let sum_skill_effect = [];
        let amber_effect = [];
        let effect_condition = [];
        let time_buff = 0;
        let equip_time_buff = 0;
        // 当前心法盘等级
        let diskLevel = this.calDiskLevel[position].current;
        // 获取上一位的厨师
        let lastChef = this.getLastChef(position);
        if (!eqp) eqp = this.calEquip[position].row[0];
        if (!condi) condi = this.calCondiment[position].row[0];
        if (!ambers) ambers = this.calAmber[position].map(a => {
          if (a && a.row[0]) {
            return a.row[0];
          }
          return null;
        });
        if (eqp && !rule.DisableEquipSkillEffect) { // 厨具
          equip_effect = eqp.effect.filter(eff => { // 对售价/时间有影响的技能效果
            if (eff.type == 'OpenTime') {
              equip_time_buff = eff.value;
            }
            return judgeEff(eff);
          });
        }
        if (condi) { // 调料
          condiment_effect = condi.effect.slice();
        }
        let ambersEffect = [];
        if (ambers.length > 0) {
          for (let amber of ambers) {
            if (!amber) {
              continue;
            }
            for (let skill of amber.skill_list) {
              for (let eff of skill.effect) {
                let effect = deepCopy(eff);
                // 心法盘等级加成
                effect.value += (diskLevel - 1) * amber.amplification;
                ambersEffect.push(effect);
                if (judgeEff(effect)) { // 对售价有影响的技能效果
                  amber_effect.push(effect);
                  effect_condition.push(effect.conditionType || -1);
                }
              }
            }
          }
        }
        let partial_flag = false;
        chef.skill_effect.forEach(eff => { // 厨师技能
          if (eff.type == 'OpenTime') {
            time_buff += eff.value;
          }
          if (judgeEff(eff)) { // 对售价有影响的技能效果
            sum_skill_effect.push(eff);
            effect_condition.push(eff.conditionType || -1);
            if (eff.condition == 'Partial') { // 有全场售价加成
              partial_flag = true;
            }
          }
        });
        // 上一位厨师的下一位类型加成
        if (lastChef && (this.ulti.Partial.id.indexOf(lastChef.uid) > -1 || this.ulti.Self.id.indexOf(lastChef.uid) > -1)) {
          lastChef.ultimate_effect.forEach(eff => {
            if (eff.condition == 'Next' && judgeEff(eff)) { // 类型=下位，且对售价有影响
              sum_skill_effect.push(eff);
              effect_condition.push(eff.conditionType || -1);
            }
          });
        }
        let chef_flag = this.getChefOnsite(chef.id);
        if (chef.ultimate_effect) {
          chef.ultimate_effect.forEach(eff => {
            if (eff.condition == 'Next') return; // 类型=下位的，加到下位身上，不给自己加
            if (eff.type == 'OpenTime' && (this.ulti.Self.id.indexOf(chef.uid) > -1 || this.ulti.Partial.id.indexOf(chef.uid) > -1)) {
              time_buff += eff.value;
            }
            if (judgeEff(eff) && (this.ulti.Self.id.indexOf(chef.uid) > -1 || this.ulti.Partial.id.indexOf(chef.uid) > -1)) { // 对售价有影响的修炼技能效果
              sum_skill_effect.push(eff);
              effect_condition.push(eff.conditionType || -1);
              if (eff.condition == 'Partial') { // 有全场售价加成
                partial_flag = true;
              }
            }
          });
        }
        chef.partial_flag = partial_flag;
        chef.effect_condition = Array.from(new Set(effect_condition));
        chef.equip_effect = equip_effect;
        chef.condiment_effect = condiment_effect;
        chef.sum_skill_effect = sum_skill_effect;
        chef.amber_effect = amber_effect;
        skill_type.forEach(key => {
          const lowKey = key.toLowerCase();
          let value = this.ulti.All; // 全体全技法
          let percentValue = 0;
          value += this.ulti[key]; // 全体单技法
          if (chef.tags.indexOf(1) > -1) { // 男厨全技法
            value += this.ulti.Male;
          }
          if (chef.tags.indexOf(2) > -1) { // 女厨全技法
            value += this.ulti.Female;
          }
          chef.skill_effect.forEach(eff => { // 常驻技能技法加成
            if (eff.type == key) {
              if (eff.cal == 'Abs') {
                value += eff.value;
              } else if (eff.cal == 'Percent') {
                percentValue += eff.value;
              }
            }
          });
          chef.MutiEquipmentSkill = 0;
          if (this.ulti.Self.id.indexOf(chef.uid) > -1 || this.ulti.Partial.id.indexOf(chef.uid) > -1) { // 已修炼的特殊修炼技能
            ultimate = true;
            chef.ultimate_effect.forEach(eff => {
              if (eff.type == key && eff.condition == 'Self') { // 个人类
                if (eff.cal == 'Abs') {
                  value += eff.value;
                } else if (eff.cal == 'Percent') {
                  percentValue += eff.value;
                }
              }
              if (eff.type == 'MutiEquipmentSkill' && eff.cal == 'Percent') { // 厨具技能加成
                chef.MutiEquipmentSkill += eff.value;
              }
            });
          }
          for (let i = 1; i < 4; i++) {
            if (this.calChef[i].row[0] &&
              (this.ulti.Partial.id.indexOf(this.calChef[i].row[0].uid) > -1 || this.ulti.Self.id.indexOf(this.calChef[i].row[0].uid) > -1)
            ) { // 已修炼且在场的上场类修炼技能
              this.calChef[i].row[0].ultimate_effect.forEach(eff => {
                if (eff.type == key && eff.condition == 'Partial') {
                  if (eff.cal == 'Abs') {
                    value += eff.value;
                  } else if (eff.cal == 'Percent') {
                    percentValue += eff.value;
                  }
                }
              });
            }
          }
          // 有上一位厨师，且已修炼，加成到本厨师上
          if (lastChef && (this.ulti.Partial.id.indexOf(lastChef.uid) > -1 || this.ulti.Self.id.indexOf(lastChef.uid) > -1)) {
            lastChef.ultimate_effect.forEach(eff => {
              if (eff.type == key && eff.condition == 'Next') {
                if (eff.cal == 'Abs') {
                  value += eff.value;
                } else if (eff.cal == 'Percent') {
                  percentValue += eff.value;
                }
              }
            });
          }
          if (chef_flag == 0 && (this.ulti.Partial.id.indexOf(chef.uid) > -1 || this.ulti.Self.id.indexOf(chef.uid) > -1)) { // 如果当前厨子不在场，且有上场类修炼技能
            chef.ultimate_effect.forEach(eff => {
              if (eff.type == key && eff.condition == 'Partial') {
                if (eff.cal == 'Abs') {
                  value += eff.value;
                } else if (eff.cal == 'Percent') {
                  percentValue += eff.value;
                }
              }
            });
          }
          if (eqp && !rule.DisableEquipSkillEffect) { // 装备厨具
            eqp.effect.forEach(eff => {
              if (eff.type == key) {
                if (eff.cal == 'Abs') {
                  value += eff.value * (100 + chef.MutiEquipmentSkill) / 100;
                } else if (eff.cal == 'Percent') {
                  percentValue += (eff.value * (100 + chef.MutiEquipmentSkill) / 100);
                }
              }
            });
          }
          // 装备遗玉
          ambersEffect.forEach(eff => {
            if (eff.type == key) {
              if (eff.cal == 'Abs') {
                value += eff.value;
              } else if (eff.cal == 'Percent') {
                percentValue += eff.value;
              }
            }
          })
          value += Math.ceil(((chef.skills[lowKey] || 0) + value) * percentValue / 100) // 百分比加成单独加
          if (this.customRule && this.customRule.skill && this.customRule.skill.Skill) { // 额外规则加成在百分比加成后
            value += Number(this.customRule.skill.Skill[lowKey]) || 0;
          }
          skills_last[lowKey] = (chef.skills[lowKey] || 0) + value;
          skills_show[lowKey] = value ? `${chef.skills[lowKey] || ''}+${value}` : chef.skills[lowKey];
        });
        time_buff += equip_time_buff * (100 + chef.MutiEquipmentSkill) / 100;
        chef.skills_show = skills_show;
        const sortKey = Object.keys(skills_last).sort((a, b)=>{
          return skills_last[b] - skills_last[a];
        });
        let skill_sort = {};
        sortKey.forEach(sk => {
          skill_sort[sk] = skills_last[sk];
        });
        chef.skills_last = skill_sort;
        chef.ultimate = ultimate;
        chef.time_buff = time_buff;
        return chef;
      },
      getChefOnsite(chefId) {
        let chef_flag = 0; // 判断当前厨子是否在场
        for (let i = 1; i < 4; i++) {
          if (this.calChef[i].row[0] && this.calChef[i].row[0].id == chefId) { // 当前厨子在场上
            chef_flag = 1
          }
        }
        return chef_flag;
      },
      getLastChef(position) { // 获取上一位的厨师
        if (position == 1) {
          return null;
        } else if (position == 2) {
          return this.calChef[1].row[0];
        } else {
          return this.calChef[2].row[0] || this.calChef[1].row[0];
        }
      },
      getCalRepShow() {
        let rst = [[], [], []];
        for (let key in this.calRep) {
          rst[key.slice(0, 1) - 1].push(this.calRep[key].row[0] ? this.showRep(this.calRep[key].row[0], key) : {});
        }
        this.calRepShow = rst;
      },
      showRep(rep, position) {
        const prop_arr = ['buff', 'buff_grade', 'buff_skill', 'buff_equip', 'buff_rule', 'buff_condiment', 'basicPrice'];
        let rst = {
          id: rep.id,
          name: rep.name_show,
          rarity: rep.rarity,
          rarity_show: rep.rarity_show,
          skills: rep.skills,
          materials: rep.materials,
          unknowBuff: rep.unknowBuff,
          condiment_show: rep.condiment_show,
          NotSure: rep.NotSure,
          cnt: this.calRepCnt[position],
          time: rep.time * this.calRepCnt[position],
          time_buff: rep.buff_time || 100,
          price: this.calRepEx[position] ? (rep.price + rep.exPrice) : rep.price,
          chef: true,
          buff_muti: rep.buff_muti,
          isCombo: rep.isCombo
        };
        rst.time_last = Math.ceil((rst.time * rst.time_buff * 100) / 10000);
        rst.time_last_show = this.formatTime(rst.time_last);
        let chefId = position.slice(0, 1);
        if (!this.calChef[position.slice(0, 1)].id[0]) { // 如果没有选厨子
          rst.chef = false;
          prop_arr.forEach(key => {
            rst[key] = rep[key];
          });
          rst.price_buff = Math.ceil(rst.price * (rst.buff - (rst.buff_condiment_sub || 0)) * rst.buff_muti / 10000);
          rst.price_total = rst.price_buff * rst.cnt;
          rst.price_wipe_rule = Math.ceil(rst.price * (rst.buff - rst.buff_rule) / 100); // 除去规则的售价
          rst.showBuff = rst.buff_grade || rst.buff_skill || rst.buff_equip || rst.buff_rule || rst.buff_muti;
          rst.price_wipe_rule_total = rst.price_wipe_rule * rst.cnt;
          rst.price_rule = rst.price_total - rst.price_wipe_rule_total;
          rst.price_origin_total = rst.price * rst.cnt;
          return rst;
        }
        rst.grade = rep[`chef_${chefId}`] ? rep[`chef_${chefId}`].grade : 0;
        rst.grade_show = rst.grade < 0 ? '' : ' 可优特神传'.slice(rst.grade, rst.grade + 1);
        if (rst.grade < 1) { // 如果技法不足
          rst.price_total = 0;
          rst.time = 0;
          rst.time_last = 0;
          rst.showBuff = false;
          rst.gap = rep[`chef_${chefId}`] ? rep[`chef_${chefId}`].subName : '';
          return rst;
        }
        prop_arr.forEach(key => {
          rst[key] = rep[`chef_${chefId}`][key];
        });
        rst.buff_condiment_sub = !this.calRepCondi[position] ? rst.buff_condiment : 0; // 是否加料
        rst.buff_condiment = this.calRepCondi[position] ? rst.buff_condiment : 0; // 是否加料
        rst.showBuff = rst.buff_grade || rst.buff_skill || rst.buff_equip || rst.buff_rule || rst.buff_condiment;
        let price = Math.floor(rst.price * (100 + rst.basicPrice) / 100);
        rst.price_buff = Math.ceil(price *(rst.buff - (rst.buff_condiment_sub || 0)) * rst.buff_muti / 10000);
        rst.price_wipe_rule = Math.ceil(price * (rst.buff - rst.buff_rule) / 100); // 除去规则的售价
        rst.price_wipe_rule_total = rst.price_wipe_rule * rst.cnt;
        rst.price_total = rst.price_buff * rst.cnt;
        rst.price_rule = rst.price_total - rst.price_wipe_rule_total;
        rst.price_origin_total = rst.price * rst.cnt;
        return rst;
      },
      initRep() {
        this.recipes = [];
        const skill_type = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
        const materials_type = ['Meat', 'Vegetable', 'Creation', 'Fish'];
        const condiment_type = ['Sweet', 'Sour', 'Spicy', 'Salty', 'Bitter', 'Tasty'];
        const invitationGuest = this.repFilter.invitationGuest;
        let giftRepIds = null;
        if (this.repFilter.invitation && invitationGuest.id && invitationGuest.id.length > 0) {
          giftRepIds = invitationGuest.row[0].gifts.map(g => g.recipeId);
        }
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
          let f_combo_rep = true;
          const comboRep = this.repFilter.comboRep;
          if (this.repFilter.combo && comboRep.id && comboRep.id.length > 0) {
            f_combo_rep = (item.comboId.indexOf(comboRep.id[0]) > -1);
          }
          let f_invitation = !this.repFilter.invitation || item.invitation_guests;
          let f_invitation_guest = giftRepIds === null ? true : (giftRepIds.indexOf(item.recipeId) > -1);
          const f_price = (this.allEx ? item.exPriceLast : item.price) > this.repFilter.price;
          const f_got = !this.repFilter.got || this.repGot[item.recipeId];
          const f_condiment = this.repFilter.condiment[item.condiment] && this.repFilter.condiment[item.condiment].flag;
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
          if (search && guest && f_rarity && f_skill && f_material && f_guest && f_combo && f_combo_rep && f_price && f_material_eff && f_got && f_condiment && f_invitation && f_invitation_guest) {
            const chef_ext = {};
            this.repChef.row.forEach(chef => {
              let min = 5;
              const diff = [];
              let diff_sum = 0;
              let buff = 100;
              const chefSkills = Object.assign({}, chef.skills);
              const chefSkillsPercent = Object.assign({}, chef.skillsPrecent);
              for (let key in chefSkills) {
                let value = chefSkills[key]; // 数值加成后的技法
                let percentValue = chefSkillsPercent[key]; // 百分比加成
                if (this.repChefEquip.id.length == 1) { // 厨具技法加成
                  const equip_eff = this.repChefEquip.row[0].effect;
                  equip_eff.forEach(eff => {
                    if (eff.type.toLowerCase() == key) {
                      if (eff.cal == 'Abs') {
                        value += eff.value * (100 + chef.MutiEquipmentSkill) / 100;
                      } else if (eff.cal == 'Percent') {
                        percentValue += (eff.value * (100 + chef.MutiEquipmentSkill) / 100);
                      }
                    }
                  });
                }
                value += Math.ceil(value * percentValue / 100); // 百分比加成单独加成
                chefSkills[key] = value;
              }
              for (const key in item.skills) {
                const grade = Math.floor(chefSkills[key] / item.skills[key]);
                min = grade >= min ? min : grade;
                if (grade < 4) {
                  const diff_value = item.skills[key] * 4 - chefSkills[key];
                  diff.push(`${this.skill_map[key]}-${diff_value}`);
                  diff_sum += diff_value;
                }
              }
              if (min > 0) { // 技法足够
                buff += this.grade_buff[min]; // 品级加成
              }
              if (this.chefUltimate) {
                if (this.chefUseAllUltimate) { // 使用全修炼
                  buff += (Number(this.allUltimate['PriceBuff_' + item.rarity]) || 0); // *星菜谱售价加成
                } else {
                  buff += (Number(this.userUltimate['PriceBuff_' + item.rarity]) || 0); // *星菜谱售价加成
                }
              }
              // 技能/修炼技能加成（如果修炼没开在chefs_list就过滤掉了）
              chef.effect.forEach(eff => {
                const type = eff.type.slice(3);
                if (eff.type.slice(0, 3) == 'Use' && !eff.conditionType) {
                  if (skill_type.indexOf(type) > -1 && item[type.toLowerCase()]) { // 技法类售价
                    buff += eff.value;
                  }
                  if (materials_type.indexOf(type) > -1 && item.materials_type.indexOf(type.toLowerCase()) > -1) { // 食材类售价
                    buff += eff.value;
                  }
                  if (condiment_type.indexOf(type) > -1 && item.condiment === type) { // 食材类售价
                    buff += eff.value;
                  }
                }
                if (eff.type == 'Gold_Gain') { // 金币获得
                  buff += eff.value;
                }
              });
              // 厨具售价加成
              if (this.repChefEquip.id.length == 1) {
                const equip_eff = this.repChefEquip.row[0].effect;
                let buff_equip = 0;
                equip_eff.forEach(eff => { // 厨具技能
                  const type = eff.type.slice(3);
                  if (eff.type == 'Gold_Gain') { // 金币加成
                    buff_equip += eff.value * (100 + chef.MutiEquipmentSkill) / 100;
                  }
                  if (eff.type.slice(0, 3) == 'Use') {
                    if (skill_type.indexOf(type) > -1 && item[type.toLowerCase()]) { // 技法类售价
                      buff_equip += eff.value * (100 + chef.MutiEquipmentSkill) / 100;
                    }
                    if (materials_type.indexOf(type) > -1 && item.materials_type.indexOf(type.toLowerCase()) > -1) { // 食材类售价
                      buff_equip += eff.value * (100 + chef.MutiEquipmentSkill) / 100;
                    }
                    if (condiment_type.indexOf(type) > -1 && item.condiment === type) { // 食材类售价
                      buff_equip += eff.value * (100 + chef.MutiEquipmentSkill) / 100;
                    }
                  }
                });
                buff += buff_equip;
              }
              chef_ext[`chef_grade_${chef.id}`] = min < 0 ? '' : ' 可优特神传'.slice(min, min + 1);
              chef_ext[`chef_diff_${chef.id}`] = diff.join('\n');
              chef_ext[`chef_eff_${chef.id}`] = min < 1 ? '' : Math.floor(Math.ceil(item.price * buff / 100) * 3600 / item.time);
              chef_ext[`chef_diff_value_${chef.id}`] = diff_sum;
              chef_ext[`chef_grade_value_${chef.id}`] = min;
            });
            item.checked = this.repGot[item.recipeId];
            this.recipes.push(Object.assign({}, item, ext, chef_ext));
          }
        }
        if (this.sort.rep.order) {
          this.handleRepSort(this.sort.rep);
        } else {
          this.recipesCurPage = 1;
          this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
        }
        if (this.repChefTask.row && this.repChefTask.row.length == 1) { // 如果有任务，排序
          const { conditions } = this.repChefTask.row[0];
          const c = conditions[0];
          this.$refs.recipesTable.sort('time_show', 'ascending');
          if (!c.anyGuest) {
            setTimeout(() => {
              this.$refs.recipesTable.sort(`chef_diff_${this.repChef.id[0]}`, 'ascending');
            });
          }
        }
        this.$nextTick(() => {
          if (this.tableShow) {
            this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
          }
        });
        if (this.repCol.got) { // 丑陋的解决方式
          this.repCol.got = false;
          setTimeout(() => {
            this.repCol.got = true;
          }, 10);
        }
      },
      changeGot(val, prop, id) {
        this[prop][id] = val;
        this.saveUserData();
      },
      setRepGot() {
        const r = this.recipesPage.find(item => {
          return item.checked == false;
        });
        let flag = r ? true : false;
        this.$confirm(`确定要将当前页展示的所有菜谱置为${flag ? '已有' : '未拥有'}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.recipesPage = this.recipesPage.map(item => {
            item.checked = flag;
            this.repGot[item.recipeId] = flag;
            return item;
          });
          this.saveUserData();
        }).catch(() => {
          //
        });
      },
      setChefGot() {
        const r = this.chefsPage.find(item => {
          return item.checked == false;
        });
        let flag = r ? true : false;
        this.$confirm(`确定要将当前页展示的所有厨师置为${flag ? '已有' : '未拥有'}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.chefsPage = this.chefsPage.map(item => {
            item.checked = flag;
            this.chefGot[item.chefId] = flag;
            return item;
          });
          this.saveUserData();
        }).catch(() => {
          //
        });
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
        let is_all = true;
        for (let key in this.chefFilter.condiment) {
          if (!this.chefFilter.condiment[key].flag) {
            is_all = false;
          }
        }
        let chefs_list = [];
        for (const item of this.data.chefs) {
          item.checked = this.chefGot[item.chefId];
          const s_name = this.checkKeyword(this.chefFilter.chefKeyword, item.name);
          const s_skill = this.checkKeyword(this.chefFilter.chefKeyword, item.skill);
          const s_ultiSkill = this.checkKeyword(this.chefFilter.chefKeyword, item.ultimateSkillShow);
          const s_origin = this.checkKeyword(this.chefFilter.chefKeyword, item.origin);
          const search = s_name || s_skill || s_ultiSkill || s_origin;
          const f_rarity = this.chefFilter.rarity[item.rarity];
          const f_got = !this.chefFilter.got || this.chefGot[item.chefId];
          let f_condiment = is_all;
          for (key in this.chefFilter.condiment) {
            if (item[key] > 0 && this.chefFilter.condiment[key].flag) {
              f_condiment = true;
            }
          }
          const sex_check = [];
          for (key in this.chefFilter.sex) {
            if (this.chefFilter.sex[key].flag) {
              sex_check.push(this.chefFilter.sex[key].name);
            }
          }
          let f_sex = false;
          for (let sex of item.sex.split('、')) {
            if (sex_check.indexOf(sex || '未知') > -1) {
              f_sex = true;
              break;
            }
          }
          const skill_arr = ['Stirfry', 'Boil', 'Knife', 'Fry', 'Bake', 'Steam'];
          const ultimate = {};
          const skills = {};
          const skillsPrecent = {};
          const partial_id = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
          let MutiEquipmentSkill = 0;
          if (item.ultimateSkill) {
            item.ultimateSkill.effect.forEach(eff => {
              if (this.chefUltimate) {
                if (this.chefUseAllUltimate) {
                  if (eff.type == 'MutiEquipmentSkill' && eff.cal == 'Percent') { // 厨具技能加成
                    MutiEquipmentSkill += eff.value;
                  }
                } else {
                  if (eff.type == 'MutiEquipmentSkill' && eff.cal == 'Percent'
                    && (userUltimate.Self.id.indexOf(partial_id) > -1 || userUltimate.Partial.id.indexOf(partial_id) > -1)
                  ) { // 厨具技能加成
                    MutiEquipmentSkill += eff.value;
                  }
                }
              }
            });
          }
          item.MutiEquipmentSkill = MutiEquipmentSkill;
          skill_arr.forEach(key => {
            let value = 0;
            let percentValue = 0;
            if (this.chefUltimate) { // 修炼开
              const effect = item.ultimateSkill ? item.ultimateSkill.effect : [];
              const partial_skill = this.partial_skill.row;
              if (this.chefUseAllUltimate) { // 全修炼
                value += this.allUltimate[key] + this.allUltimate.All;
                if (item.tags && item.tags.indexOf(1) > -1) value += this.allUltimate.Male;
                if (item.tags && item.tags.indexOf(2) > -1) value += this.allUltimate.Female;
                partial_skill.forEach(s => { // 上场类技能-给别人加
                  if (s.id != partial_id) {
                    s.effect.forEach(e => {
                      if (e.type == key) value += e.value;
                    });
                  }
                });
              } else { // 已修炼
                value += (userUltimate[key] || 0) + (userUltimate.All || 0);
                if (item.tags && item.tags.indexOf(1) > -1) value += (userUltimate.Male || 0);
                if (item.tags && item.tags.indexOf(2) > -1) value += (userUltimate.Female || 0);
                partial_skill.forEach(s => { // 上场类技能-给别人加
                  if (s.id != partial_id || userUltimate.Partial.id.indexOf(s.id) < 0) {
                    s.effect.forEach(e => {
                      if (e.type == key) value += e.value;
                    });
                  }
                });
              }
              effect.forEach(eff => {
                if (this.chefUseAllUltimate) { // 全修炼
                  if (this.allUltimate.Partial.id.indexOf(partial_id) > -1 && eff.type == key && eff.condition != 'Next') { // 上场类技能-给自己加
                    if (eff.cal == 'Abs') {
                      value += eff.value;
                    } else if (eff.cal == 'Percent') {
                      percentValue += eff.value;
                    }
                  }
                  if (this.allUltimate.Self.id.indexOf(partial_id) > -1 && eff.type == key) { // 给自己加的修炼技能
                    if (eff.cal == 'Abs') {
                      value += eff.value;
                    } else if (eff.cal == 'Percent') {
                      percentValue += eff.value;
                    }
                  }
                } else { // 已修炼
                  if (userUltimate.Partial.id.indexOf(partial_id) > -1 && eff.type == key && eff.condition != 'Next') { // 上场类技能-给自己加
                    if (eff.cal == 'Abs') {
                      value += eff.value;
                    } else if (eff.cal == 'Percent') {
                      percentValue += eff.value;
                    }
                  }
                  if (userUltimate.Self.id.indexOf(partial_id) > -1 && eff.type == key) { // 给自己加的修炼技能
                    if (eff.cal == 'Abs') {
                      value += eff.value;
                    } else if (eff.cal == 'Percent') {
                      percentValue += eff.value;
                    }
                  }
                }
              });
            }
            item.skill_obj.effect.forEach(eff => { // 常驻技能加技法值
              if (eff.type == key) {
                if (eff.cal == 'Abs') {
                  value += eff.value;
                } else if (eff.cal == 'Percent') {
                  percentValue += eff.value;
                }
              }
            });
            skills[key.toLowerCase()] = (item[key.toLowerCase()] + value) || 0; // 绝对值加成后的技法值
            value += Math.ceil(((item[key.toLowerCase()] || 0) + value) * percentValue / 100);
            ultimate[`${key}_show`] = (item[key.toLowerCase()] || '') + `${value ? '+' + value : ''}`;
            ultimate[`${key}_last`] = (item[key.toLowerCase()] + value) || '';
            skillsPrecent[key.toLowerCase()] = percentValue; // 百分比加成
          });

          let f_skills = true;
          for (key in this.chefFilter.skills) {
            const lastKey = key.slice(0, 1).toUpperCase() + key.slice(1) + '_last';
            f_skills = f_skills && (this.chefFilter.skills[key].val == '' || (ultimate[lastKey] >= this.chefFilter.skills[key].val));
          }

          const condiment_arr = [];
          const eff = item.ultimateSkill ? item.ultimateSkill.effect : [];
          let condiment_value = 0;
          for (let key in this.condimentMap) {
            let ulti = 0;
            if (this.chefUltimate) { // 修炼开
              for (let e of eff) {
                if (this.chefUseAllUltimate) { // 全修炼
                  if (this.allUltimate.Self.id.indexOf(partial_id) > -1 && e.type == key && e.cal == 'Abs') { // 给自己加的修炼技能
                    ulti += e.value;
                  }
                } else { // 已修炼
                  if (userUltimate.Self.id.indexOf(partial_id) > -1 && e.type == key && e.cal == 'Abs') {
                    ulti = e.value;
                  }
                }
              }
            }
            if (item[key.toLowerCase()] > 0 || ulti) {
              condiment_arr.push(`${this.condimentMap[key]}-${item[key.toLowerCase()] + ulti}`);
              condiment_value += (item[key.toLowerCase()] + ulti);
            }
          }
          item.condiment_value = condiment_value;
          item.condiment_show = condiment_arr.join(' ');

          let effect = item.skill_obj.effect;
          const uId = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
          if (this.chefUltimate && ((this.chefUseAllUltimate && this.allUltimate.Self.id.indexOf(uId) > -1) || userUltimate.Self.id.indexOf(uId) > -1)) { // 个人类修炼
            effect = effect.concat(item.ultimateSkill.effect);
          }
          chefs_list.push({
            id: item.chefId,
            name: item.name,
            MutiEquipmentSkill: item.MutiEquipmentSkill,
            skills, // 绝对值加成后的技法值
            skillsPrecent, // 百分比加成
            effect
          });
          if (search && f_rarity && f_skills && f_sex && f_got && f_condiment) {
            const rep_ext = {};
            this.chefRep.row.forEach(rep => {
              let min = 5;
              const diff = {};
              let diff_sum = {};
              let buff = 100;
              this.chef_skill_gap_list.forEach(item => {
                diff[item.id] = [];
                diff_sum[item.id] = 0;
                for (const key in rep.skills) {
                  const chef_key = key.slice(0, 1).toUpperCase() + key.slice(1) + '_last';
                  const grade = Math.floor((ultimate[chef_key] || 0) / rep.skills[key]);
                  min = grade > min ? min : grade;
                  if (grade < item.id) {
                    const diff_value = rep.skills[key] * item.id - ultimate[chef_key];
                    diff[item.id].push(`${this.skill_map[key]}-${diff_value}`);
                    diff_sum[item.id] += diff_value;
                  }
                }
              });
              if (min > 0) { // 技法足够
                buff += this.grade_buff[min]; // 品级加成
                if (this.chefUltimate) { // 修炼加成
                  if (this.chefUseAllUltimate) { // 使用全修炼
                    buff += (Number(this.allUltimate['PriceBuff_' + rep.rarity]) || 0); // *星菜谱售价加成
                  } else {
                    buff += (Number(this.userUltimate['PriceBuff_' + rep.rarity]) || 0); // *星菜谱售价加成
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
              rep_ext[`rep_grade_${rep.id}`] = min < 0 ? '' : ' 可优特神传'.slice(min, min + 1);
              this.chef_skill_gap_list.forEach(item => {
                rep_ext[`rep_diff_${item.id}_${rep.id}`] = diff[item.id].join('\n');
                rep_ext[`rep_diff_value_${item.id}_${rep.id}`] = diff_sum[item.id];
              })
              rep_ext[`rep_eff_${rep.id}`] = min < 1 ? '' : Math.floor(Math.ceil(rep.price * buff / 100) * 3600 / rep.time);
              rep_ext[`rep_grade_value_${rep.id}`] = min;
            });
            this.chefs.push(Object.assign({}, item, ultimate, skills, rep_ext));
          }
        }
        this.chefs_list = chefs_list.slice().reverse();
        if (this.sort.chef.order) {
          this.handleChefSort(this.sort.chef);
        } else {
          this.chefsCurPage = 1;
          this.chefsPage = this.chefs.slice(0, this.chefsPageSize);
        }
        if (this.chefCol.got) { // 丑陋的解决方式
          this.chefCol.got = false;
          setTimeout(() => {
            this.chefCol.got = true;
          }, 10);
        }
        this.$nextTick(() => {
          if (this.tableShow) {
            this.$refs.chefsTable.bodyWrapper.scrollTop = 0;
          }
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
      initAmber() {
        this.ambers = [];
        for (const item of this.data.ambers) {
          const s_name = this.checkKeyword(this.amberFilter.amberKeyword, item.name);
          const s_skill = this.checkKeyword(this.amberFilter.amberKeyword, item.skill);
          const s_origin = this.checkKeyword(this.amberFilter.amberKeyword, item.origin);
          const search = s_name || s_skill || s_origin;
          const f_rarity = this.amberFilter.rarity[item.rarity];
          const f_origin = this.amberFilter.origin[item.type].flag;
          let f_skill = false;
          for (const group of this.amberFilter.skillType) {
            for (const key in group) {
              if (group[key].flag) {
                f_skill = f_skill || (item.skill_type.indexOf(key) > -1);
              }
            }
          }
          if (search && f_rarity && f_origin && f_skill) {
            this.ambers.push(item);
          }
        }
        if (this.sort.amber.order) {
          this.handleAmberSort(this.sort.amber);
        } else {
          this.ambersCurPage = 1;
          this.ambersPage = this.ambers.slice(0, this.ambersPageSize);
        }
        this.$nextTick(() => {
          this.$refs.ambersTable.bodyWrapper.scrollTop = 0;
        });
      },
      initCondiment() {
        this.condiments = [];
        for (const item of this.data.condiments) {
          const s_name = this.checkKeyword(this.condimentFilter.condimentKeyword, item.name);
          const s_skill = this.checkKeyword(this.condimentFilter.condimentKeyword, item.skill);
          const s_origin = this.checkKeyword(this.condimentFilter.condimentKeyword, item.origin);
          const search = s_name || s_skill || s_origin;
          const f_rarity = this.condimentFilter.rarity[item.rarity];
          let f_skill = this.condiment_concurrent;
          for (const key in this.condimentFilter.skillType) {
            if (this.condimentFilter.skillType[key].flag) {
              if (this.condiment_concurrent) {
                f_skill = f_skill && this.checkCondimentSkillType(key, {
                  obj: item.skill_type,
                  desc: item.skill
                });
              } else {
                f_skill = f_skill || this.checkCondimentSkillType(key, {
                  obj: item.skill_type,
                  desc: item.skill
                });
              }
            }
          }
          if (search && f_rarity && f_skill) {
            this.condiments.push(item);
          }
        }
        if (this.sort.condiment.order) {
          this.handleCondimentSort(this.sort.condiment);
        } else {
          this.condimentsCurPage = 1;
          this.condimentsPage = this.condiments.slice(0, this.condimentsPageSize);
        }
        this.$nextTick(() => {
          this.$refs.condimentsTable.bodyWrapper.scrollTop = 0;
        });
      },
      initDecoration() {
        this.decorations = [];
        const position_arr = this.decorationFilter.position.filter(p => { return p.flag }).map(p => p.name);
        const time_arr = this.decorationFilter.time.id;
        for (item of this.data.decorations) {
          const s_name = this.checkKeyword(this.decorationFilter.keyword, item.name);
          const s_suit = this.checkKeyword(this.decorationFilter.keyword, item.suit);
          const s_origin = this.checkKeyword(this.decorationFilter.keyword, item.origin);
          const search = s_name || s_suit || s_origin;
          const f_postion = position_arr.indexOf(item.position) > -1;
          const f_time = time_arr.length == 0 || time_arr.indexOf(item.tipTime) > -1;
          if (search && f_postion && f_time) {
            this.decorations.push(item);
          }
        }
        if (this.sort.decoration.order) {
          this.handleDecorationSort(this.sort.decoration);
        } else {
          this.decorationsCurPage = 1;
          const decorationsPage = this.decorations.slice(0, this.decorationsPageSize)
          this.decorationsPage = decorationsPage.map(d => {
            return Object.assign({}, d, { checked: this.decoSelectId.indexOf(d.id) > -1 });
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
              if (this.mapFilter.vip) {
                min = percent(min, 10)
                max = percent(max, 10)
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
        this.chartOption = chartOption;
        const myChart = echarts.init(document.getElementById('chart'));
        this.myChart = myChart;
        myChart.setOption(chartOption);
      },
      handlePageSizeChange(val, prop) {
        setTimeout(() => {
          if (prop == 'quests') {
            this.initQuests();
          } else {
            this[`${prop}CurPage`] = 1;
            this[`${prop}Page`] = this[prop].slice(0, val);
          }
        }, 50);
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
      checkCondimentSkillType(key, { obj, desc }) {
        return this.equipFilter.buff ? obj[key] === 'buff' : Boolean(obj[key]);
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
        if (sec == 0) {
          return 0;
        }
        let rst = '';
        const DAY = 86400;
        const HOUR = 3600;
        const MIN = 60;
        if (sec >= DAY) {
          rst += `${~~(sec / DAY)}天`;
          sec = sec % DAY;
        }
        if (sec >= HOUR) {
          rst += `${~~(sec / HOUR)}小时`;
          sec = sec % HOUR;
        }
        if (sec >= MIN) {
          rst += `${~~(sec / MIN)}分`;
          sec = sec % MIN;
        }
        if (sec > 0) {
          rst += `${sec}秒`;
        }
        return rst;
      },
      handleCurrentChange(val) {
        const map = {
          1: 'recipes',
          2: 'chefs',
          3: 'equips',
          4: 'decorations',
          7: 'calReps',
          10: 'condiments',
          12: 'ambers',
        }
        const nav = this.navId;
        if (nav === 6) {
          this.questsCurPage = val;
          const size = this.questsPageSize;
          const quests = this.questsType === 1 ? this.questsMain : (this.questsType === 2 ? this.questsRegional : this.questsRegionalNew);
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
          total_time_show: 'total_time',
          exTimeShow1: 'exTime1',
          exTimeShow2: 'exTime2',
          exTimeShow3: 'exTime3',
          exTimeShow4: 'exTime4',
          exTimeShow5: 'exTime5',
        };
        if (!sort.order) {
          this.initRep();
        }
        if (sort.prop == 'got') {
          const order_map = {
            ascending: -1,
            descending: 1,
          }
          this.recipes.sort((x, y) => {
            if (!this.repGot[x.recipeId] && this.repGot[y.recipeId]) {
              return order_map[sort.order];
            } else if (this.repGot[x.recipeId] && !this.repGot[y.recipeId]) {
              return 0 - order_map[sort.order];
            } else {
              return 0;
            }
          });
        } else {
          sort.prop = map[sort.prop] || sort.prop;
          let arr = sort.prop.split('_');
          let id = arr[arr.length - 1];
          if (sort.prop.indexOf('chef_diff_') > -1) {
            sort.prop = 'chef_diff_value_' + id;
          }
          if (sort.prop.indexOf('chef_grade_') > -1) {
            sort.prop = 'chef_grade_value_' + id;
          }
          this.recipes.sort(this.customSort(sort));
        }
        this.recipesCurPage = 1;
        this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
        });
      },
      handleCalRepSort(sort) {
        this.sort.calRep = sort;
        const map = {
          rarity_show: 'rarity',
          total_time_show: 'total_time',
          buff_rule_show: 'buff_rule'
        };
        if (!sort.order) {
          this.initCalRepSearch();
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.calRepsCurPage = 1;
        this.calReps.sort(this.customSort(sort));
        this.calRepsPage = this.calReps.slice(0, this.calRepsPageSize);
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.calRepsTable.doLayout();
          }
        });
      },
      handleChefSort(sort) {
        this.sort.chef = sort;
        const map = {
          galleryId: 'chefId',
          rarity_show: 'rarity',
          Stirfry_show: 'Stirfry_last',
          Boil_show: 'Boil_last',
          Knife_show: 'Knife_last',
          Bake_show: 'Bake_last',
          Fry_show: 'Fry_last',
          Steam_show: 'Steam_last',
          condiment_show: 'condiment_value',
        };
        if (!sort.order) {
          this.initChef();
        }
        if (sort.prop == 'got') {
          const order_map = {
            ascending: -1,
            descending: 1,
          }
          this.chefs.sort((x, y) => {
            if (!this.chefGot[x.chefId] && this.chefGot[y.chefId]) {
              return order_map[sort.order];
            } else if (this.chefGot[x.chefId] && !this.chefGot[y.chefId]) {
              return 0 - order_map[sort.order];
            } else {
              return 0;
            }
          });
        } else {
          let arr = sort.prop.split('_');
          let id = arr[arr.length - 1];
          this.chef_skill_gap_list.forEach(item => {
            if (sort.prop.indexOf(`rep_diff_${item.id}_`) > -1) {
              sort.prop = sort.prop.replace('rep_diff', 'rep_diff_value');
            }
          });
          if (sort.prop.indexOf('rep_grade_') > -1) {
            sort.prop = 'rep_grade_value_' + id;
          }
          sort.prop = map[sort.prop] || sort.prop;
          this.chefs.sort(this.customSort(sort));
        }
        this.chefsCurPage = 1;
        this.chefsPage = this.chefs.slice(0, this.chefsPageSize);
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.chefsTable.doLayout();
          }
        });
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
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.equipsTable.doLayout();
          }
        });
      },
      handleAmberSort(sort) {
        this.sort.amber = sort;
        const map = {
          rarity_show: 'rarity',
        };
        if (!sort.order) {
          this.initEquip();
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.ambersCurPage = 1;
        this.ambers.sort(this.customSort(sort));
        this.ambersPage = this.ambers.slice(0, this.ambersPageSize);
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.ambersTable.doLayout();
          }
        });
      },
      handleCondimentSort(sort) {
        this.sort.condiment = sort;
        const map = {
          rarity_show: 'rarity',
        };
        if (!sort.order) {
          this.initCondiment();
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.condimentsCurPage = 1;
        this.condiments.sort(this.customSort(sort));
        this.condimentsPage = this.condiments.slice(0, this.condimentsPageSize);
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.condimentsTable.doLayout();
          }
        });
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
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.decorationsTable.doLayout();
          }
        });
      },
      checkRow(curRow) {
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
        } else if (this.questsType === 2) {
          this.questsRegional.sort(this.customSort(sort));
          this.questsPage = this.questsRegional.slice(0, this.questsPageSize);
        } else if (this.questsType === 3) {
          this.questsRegionalNew.sort(this.customSort(sort));
          this.questsPage = this.questsRegionalNew.slice(0, this.questsPageSize);
        }
        this.$nextTick(()=>{
          this.$refs.questsTable.doLayout();
        });
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
        this.questsRegionalNew = [];
        for (let item of this.data.quests) {
          item.rewards = item.rewards || [];
          const rewards = item.rewards.map(r => {
            return r.quantity ? `${r.name} * ${r.quantity}` : r.name;
          });
          item.rewards_show = rewards.join('\n');
          const search = String(item.questId).indexOf(key) > -1 || item.goal.indexOf(key) > -1 || item.rewards_show.indexOf(key) > -1;
          if (item.type === '主线任务' && search) {
            item.questIdDisp = item.questId;
            this.questsMain.push(item);
          } else if (item.type === '旧支线任务' && search) {
            this.questsRegional.push(item);
          } else if (item.type === '新支线任务' && search) {
            this.questsRegionalNew.push(item);
          }
        }
        let size = this.questsPageSize;
        this.questsPage = this.questsType == 1 ? this.questsMain.slice(0, size) : (this.questsType == 2 ? this.questsRegional.slice(0, size) : this.questsRegionalNew.slice(0, size));
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
        } else if (obj === 'repFilter.condiment') {
          this.condiment_radio = false;
          const condiment = JSON.parse(JSON.stringify(this.repFilter.condiment));
          for (const key in condiment) {
            if (!condiment[key].flag) {
              flag = true;
            }
          }
          for (const key in condiment) {
            condiment[key].flag = flag;
          }
          this.repFilter.condiment = condiment;
        } else if (obj === 'chefFilter.condiment') {
          this.chefFilter.condiment_radio = false;
          const condiment = JSON.parse(JSON.stringify(this.chefFilter.condiment));
          for (const key in condiment) {
            if (!condiment[key].flag) {
              flag = true;
            }
          }
          for (const key in condiment) {
            condiment[key].flag = flag;
          }
          this.chefFilter.condiment = condiment;
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
        } else if (obj === 'amberFilter.skillType') {
          this.amber_radio = false;
          const skillType = JSON.parse(JSON.stringify(this.amberFilter.skillType));
          for (const group of skillType) {
            for (const key in group) {
              if (!group[key].flag) {
                flag = true;
                break;
              }
            }
          }
          for (const group of skillType) {
            for (const key in group) {
              group[key].flag = flag;
            }
          }
          this.amberFilter.skillType = skillType;
        } else if (obj === 'condimentFilter.skillType') {
          this.condiment_radio = false;
          this.condiment_concurrent = false;
          const skillType = JSON.parse(JSON.stringify(this.condimentFilter.skillType));
          for (const key in skillType) {
            if (!skillType[key].flag) {
              flag = true;
            }
          }
          for (const key in skillType) {
            skillType[key].flag = flag;
          }
          this.condimentFilter.skillType = skillType;
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
      checkCondiment(key) {
        if (this.condiment_radio) {
          const condiment = JSON.parse(JSON.stringify(this.repFilter.condiment));
          for (const k in condiment) {
            if (k === key) {
              condiment[k].flag = !condiment[k].flag;
            } else {
              condiment[k].flag = false;
            }
          }
          this.repFilter.condiment = condiment;
        } else {
          this.repFilter.condiment[key].flag = !this.repFilter.condiment[key].flag;
        }
      },
      checkChefCondiment(key) {
        if (this.chefFilter.condiment_radio) {
          const condiment = JSON.parse(JSON.stringify(this.chefFilter.condiment));
          for (const k in condiment) {
            if (k === key) {
              condiment[k].flag = !condiment[k].flag;
            } else {
              condiment[k].flag = false;
            }
          }
          this.chefFilter.condiment = condiment;
        } else {
          this.chefFilter.condiment[key].flag = !this.chefFilter.condiment[key].flag;
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
      clickAmberSkillType(idx, key) {
        if (this.amber_radio) {
          const skill = JSON.parse(JSON.stringify(this.amberFilter.skillType));
          for (const group of skill) {
            for (const k in group) {
              if (k === key) {
                group[k].flag = !group[k].flag;
              } else {
                group[k].flag = false;
              }
            }
          }
          this.amberFilter.skillType = skill;
        } else {
          this.amberFilter.skillType[idx][key].flag = !this.amberFilter.skillType[idx][key].flag;
        }
      },
      checkCondiSkillType(key) {
        if (this.condiment_radio) {
          const skill = JSON.parse(JSON.stringify(this.condimentFilter.skillType));
          for (const k in skill) {
            if (k === key) {
              skill[k].flag = !skill[k].flag;
            } else {
              skill[k].flag = false;
            }
          }
          this.condimentFilter.skillType = skill;
        } else {
          this.condimentFilter.skillType[key].flag = !this.condimentFilter.skillType[key].flag;
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
      changeRepCondimentRadio(val) {
        if (val) {
          const condiment = JSON.parse(JSON.stringify(this.repFilter.condiment));
          let cnt = 0;
          for (const key in condiment) {
            if (condiment[key].flag) {
              cnt++;
            }
          }
          if (cnt > 1) {
            for (const key in condiment) {
              condiment[key].flag = false;
            }
            this.repFilter.condiment = condiment;
          }
        }
      },
      changeChefCondimentRadio(val) {
        if (val) {
          const condiment = JSON.parse(JSON.stringify(this.chefFilter.condiment));
          let cnt = 0;
          for (const key in condiment) {
            if (condiment[key].flag) {
              cnt++;
            }
          }
          if (cnt > 1) {
            for (const key in condiment) {
              condiment[key].flag = false;
            }
            this.chefFilter.condiment = condiment;
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
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
        });
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
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.equipsTable.doLayout();
          }
        });
      },
      changeAmberRadio(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.amberFilter.skillType));
          let cnt = 0;
          for (let group of skill) {
            for (const key in group) {
              if (group[key].flag) {
                cnt++;
              }
            }
          }
          if (cnt > 1) {
            for (let group of skill) {
              for (const key in group) {
                group[key].flag = false;
              }
            }
            this.amberFilter.skillType = skill;
          }
        }
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.ambersTable.doLayout();
          }
        });
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
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.equipsTable.doLayout();
          }
        });
      },
      changeCondimentRadio(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.condimentFilter.skillType));
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
            this.condimentFilter.skillType = skill;
          }
        }
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.condimentsTable.doLayout();
          }
        });
      },
      changeCondimentConcurrent(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.condimentFilter.skillType));
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
            this.condimentFilter.skillType = skill;
          } else {
            this.initCondiment();
          }
        } else {
          this.initCondiment();
        }
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.condimentsTable.doLayout();
          }
        });
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
          4: 'Decoration',
          12: 'Amber'
        };
        if (map[this.navId]) {
          this[map[this.navId].toLowerCase() + 'Filter'] = JSON.parse(JSON.stringify(this['origin' + map[this.navId] + 'Filter']));
        }
        if (this.navId === 1) {
          this.skill_radio = false;
          this.condiment_radio = false;
          this.skill_type = false;
          this.repKeyword = '';
          this.guestKeyword = '';
          this.$refs.materialEff.clear();
          if (this.$refs.repChefTask) {
            this.$refs.repChefTask.clear();
          }
        } else if (this.navId === 3) {
          this.equip_radio = false;
          this.equip_concurrent = false;
        } else if (this.navId === 12) {
          this.amber_radio = false;
        } else if (this.navId === 4) {
          this.decoration_radio = false;
          this.$refs.decoTime.clear();
        } else if (this.navId === 7) {
          this.calKeyword = '';
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
      calScroll() {
        if (window.innerWidth < 669) {
          const val = 440 + this.extraHeight - window.innerHeight / 2; // 保证输入框的位置在屏幕的中间偏上不被键盘遮挡
          if ($('.cal').scrollTop() < val && window.innerHeight > 440) { // 屏幕过短时不弹出
            $('.cal').scrollTop(val);
          }
        }
      },
      saveUserData() {
        const userData = {
          repCol: this.repCol,
          calRepCol: this.calRepCol,
          chefCol: this.chefCol,
          equipCol: this.equipCol,
          amberCol: this.amberCol,
          condimentCol: this.condimentCol,
          decorationCol: this.decorationCol,
          mapCol: this.mapCol,
          userUltimate: this.userUltimate,
          userNav: this.userNav,
          showDetail: this.showDetail,
          defaultEx: this.defaultEx,
          defaultDiskMax: this.defaultDiskMax,
          hiddenDisk: this.hiddenDisk,
          calShowGot: this.calShowGot,
          hideSuspend: this.hideSuspend,
          hiddenMessage: this.hiddenMessage,
          repGot: this.repGot,
          chefGot: this.chefGot,
          planList: this.planList,
          allEx: this.allEx,
          customRules: this.customRules
        };
        localStorage.setItem('data', JSON.stringify(userData));
      },
      getUserData() {
        let userData = localStorage.getItem('data');
        const colName = ['repCol', 'calRepCol', 'chefCol', 'equipCol', 'amberCol', 'condimentCol', 'decorationCol', 'mapCol', 'userUltimate'];
        const propName = ['defaultEx', 'defaultDiskMax', 'hiddenDisk', 'calShowGot', 'hideSuspend', 'hiddenMessage', 'repGot', 'chefGot', 'userNav', 'showDetail', 'planList', 'allEx'];
        if (userData) {
          try {
            this.userData = JSON.parse(userData);
            colName.forEach(col => {
              this.putUserCol(col);
            });
            propName.forEach(prop => {
              this[prop] = this.userData[prop] == null ? this[prop] : this.userData[prop];
            });
            if (this.userData.customRules) {
              this.customRules = JSON.parse(JSON.stringify(this.userData.customRules));
            }
          } catch(e) {
            console.log('个人数据解析错误', e);
            this.$message({
              showClose: true,
              message: '个人数据解析错误！',
              type: 'error'
            });
          }
        }
        this.extraHeight = localStorage.getItem('extraHeight') ? Number(localStorage.getItem('extraHeight')) : 0;
        if (this.data.recipes) {
          this.initRep();
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
          this.$message({
            showClose: true,
            message: '导入成功',
            type: 'success'
          });
        } catch(e) {
          this.$message({
            showClose: true,
            message: '导入失败',
            type: 'error'
          });
        }
      },
      trans(arr, key) {
        const result = {};
        for (const item of arr) {
          result[item.id] = (item[key] == '是');
        }
        return result;
      },
      setUlti(chefUlt) {
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
          if (chefUlt[item.chefId]) {
            const id = item.ultimateSkill ? `${item.chefId},${item.ultimateSkill.skillId}` : null;
            if (item.ultimateSkillCondition == 'Partial' || item.ultimateSkillCondition == 'Next') {
              allUltimate.Partial.id.push(id);
              allUltimate.Partial.row.push({
                id,
                name: item.name,
                subName: item.ultimateSkillShow,
                effect: item.ultimateSkill.effect,
              });
              partial_skill.push({
                id,
                name: item.name,
                subName: item.ultimateSkillShow,
                effect: item.ultimateSkill.effect,
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
            if (item.ultimateSkill && item.ultimateSkill.desc.indexOf('全技法') < 0) {
              item.ultimateSkill.effect.forEach(effect => {
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
              });
            }
            if (item.ultimateSkill && item.ultimateSkill.desc.indexOf('全技法') > -1 && item.ultimateSkill.effect[0].condition == 'Global') {
              const effect = item.ultimateSkill.effect[0];
              if (effect.tag == 1) {
                global_obj.Male += effect.value;
              } else if (effect.tag == 2) {
                global_obj.Female += effect.value;
              } else {
                global_obj.All += effect.value;
              }
            }
          }
        });
        return Object.assign({}, allUltimate, skill_obj, global_obj, price_obj, limit_obj);
      },
      syncUserData() {
        let that = this;
        if (!this.userDataCode) {
          return;
        }
        $.ajax({
          url: `https://yx518.com/api/archive.do?token=${this.userDataCode}`,
          type: 'GET'
        }).then(rst => {
          rst = JSON.parse(rst);
          if (rst.ret != 'S') {
            that.$message({
              type: 'error',
              message: `导入失败：${rst.msg}`,
              showClose: true,
            });
          } else {
            try {
              this.importData(rst.msg);
              this.$message({
                showClose: true,
                message: '导入成功',
                type: 'success'
              });
              this.userDataCode = '';
            } catch(e) {
              console.log(e);
              this.$message({
                showClose: true,
                message: '导入失败：数据解析失败',
                type: 'error'
              });
            }
          }
        }).fail(err => {
          that.$message({
            type: 'error',
            message: '导入失败：服务端错误',
            showClose: true,
          });
          console.log(err);
        });
      },
      importLDataText() {
        let data;
        try {
          data = JSON.parse(this.LDataText);
          this.importData(data);
          this.LDataText = '';
          this.$message({
            showClose: true,
            message: '导入成功',
            type: 'success'
          });
        } catch(e) {
          console.log(e);
          this.$message({
            showClose: true,
            message: '导入失败：数据解析失败',
            type: 'error'
          });
        }
      },
      importData(data) {
        let userData = localStorage.getItem('data');
        userData = userData ? JSON.parse(userData) : {};
        userData.repGot = this.trans(data.recipes, 'got');
        userData.chefGot = this.trans(data.chefs, 'got');
        userData.chefUlt = this.trans(data.chefs, 'ult');
        const decoBuff = data.decorationEffect;
        userData.userUltimate = Object.assign({ decoBuff }, this.setUlti(userData.chefUlt));

        localStorage.setItem('data', JSON.stringify(userData));
        this.getUserData();
        setTimeout(() => {
          if (userData.userUltimate.Partial.id.length > 0) {
            this.$refs.userPartial.initOption();
          } else {
            this.$refs.userPartial.clear();
          }
          if (userData.userUltimate.Self.id.length > 0) {
            this.$refs.userSelf.initOption();
          } else {
            this.$refs.userSelf.clear();
          }
        }, 50);
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
      openLFile() {
        $('#Lfile').click();
      },
      importUserData(e) {
        const input = e.target;
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
        e.target.value = null;
      },
      importLData(e) {
        const input = e.target;
        const reader = new FileReader();
        const that = this;
        reader.onload = function() {
          if(reader.result) {
            let data;
            try {
              data = JSON.parse(reader.result);
              console.log(data)
              let userData = localStorage.getItem('data');
              userData = userData ? JSON.parse(userData) : {};
              userData.repGot = that.trans(data.recipes, 'got');
              userData.chefGot = that.trans(data.chefs, 'got');
              userData.chefUlt = that.trans(data.chefs, 'ult');
              const decoBuff = data.decorationEffect;
              userData.userUltimate = Object.assign({ decoBuff }, that.setUlti(userData.chefUlt));

              localStorage.setItem('data', JSON.stringify(userData));
              that.getUserData();
              setTimeout(() => {
                if (userData.userUltimate.Partial.id.length > 0) {
                  that.$refs.userPartial.initOption();
                } else {
                  that.$refs.userPartial.clear();
                }
                if (userData.userUltimate.Self.id.length > 0) {
                  that.$refs.userSelf.initOption();
                } else {
                  that.$refs.userSelf.clear();
                }
              }, 50);
              that.$message.success('导入成功');
            } catch(e) {
              console.log(e)
              that.$message.error('导入失败');
            }
          }
        };
        reader.readAsText(input.files[0]);
        e.target.value = null;
      },
      async uploadData() {
        const that = this;
        const url = that.url;
        this.$prompt('数据暂存时限为24小时，单用户24小时上传上限为10次，所有用户24小时上传上限为5000次。<strong>请勿无节制上传！</strong><br>请在下面填入昵称（随便填，只是核对用，防止误导入别人的数据）：', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          inputPattern: /^.{1,10}$/,
          inputErrorMessage: '昵称字数在1~10个之间',
        }).then(({ value }) => {
          value = value.trim();
          that.saveUserData();
          const data = localStorage.getItem('data');
          $.ajax({
            url: `${url}/upload_data`,
            type: 'POST',
            dataType: 'json',
            data: {
              user: value,
              data,
            },
          }).then(rst => {
            if (!rst.result) {
              that.$message({
                type: 'error',
                message: `上传失败：${rst.msg}`,
                showClose: true,
              });
            } else {
              localStorage.setItem('cloudId', JSON.stringify({id:rst.insertId,time:new Date()}));
              that.$notify({
                title: '上传成功',
                message: `数据ID：${rst.insertId}<br>获取云端数据时数据ID是唯一的识别码，请务必保管好您的数据ID！`,
                dangerouslyUseHTMLString: true,
                duration: 0
              });
              that.getCloudId();
            }
          }).fail(err => {
            that.$message({
              type: 'error',
              message: '上传失败：服务端错误',
              showClose: true,
            });
            console.log(err);
          });
        }).catch(() => { });
      },
      async downloadData() {
        const that = this;
        const url = that.url;
        this.$prompt('请填写数据ID（需要先上传个人数据才能通过ID获取暂存的数据）：', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^\d{1,10}$/,
          inputErrorMessage: '数据ID为10位以下的纯数字',
        }).then(({ value }) => {
          value = value.trim();
          $.ajax({
            url: `${url}/download_data`,
            data: {
              id: value,
            },
          }).then(rst => {
            if (rst.result) {
              that.$confirm(`是否确定导入【${rst.user}】的个人数据？<br/>如果是导入他人数据，记得<strong style="color:red">先保存好自己的个人数据</strong>！`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                dangerouslyUseHTMLString: true,
                type: 'info'
              }).then(() => {
                try {
                  localStorage.setItem('data', rst.data);
                  that.getUserData();
                  setTimeout(() => {
                    that.$refs.userPartial.initOption();
                    that.$refs.userSelf.initOption();
                  }, 50);
                  that.$message({
                    showClose: true,
                    message: '导入成功',
                    type: 'success'
                  });
                } catch(e) {
                  that.$message({
                    showClose: true,
                    message: '导入失败',
                    type: 'error'
                  });
                }
              }).catch(() => {});
            } else {
              that.$message({
                type: 'error',
                message: `获取云端数据失败：${rst.msg}`,
                showClose: true,
              });
            }
          }).fail(err => {
            that.$message({
              type: 'error',
              message: '获取云端数据失败：服务端错误',
              showClose: true,
            });
            console.log(err);
          });
        }).catch(() => {});
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
      resetCustomRule() {
        this.customRule = JSON.parse(JSON.stringify(this.calType.row[0].CustomRule || null));
      },
      changeChefUltimate(val) {
        this.initChef();
        if (!val) {
          this.$refs.partialSkill.clear();
        }
      },
      setAllUltimate() {
        const that = this;
        that.$confirm(`是否确定导入全修炼数据？此操作会覆盖原有修炼数据且不能恢复`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let userUltimate = JSON.parse(JSON.stringify(that.allUltimate));
          that.userUltimate = Object.assign(userUltimate, {
            decoBuff: that.userUltimate.decoBuff
          });
          setTimeout(() => {
            that.$refs.userPartial.initOption();
            that.$refs.userSelf.initOption();
          }, 50);
        });
      },
      setAllExistUltimate() {
        const that = this;
        that.$confirm(`是否确定将已有厨师全部设为已修炼？此操作会覆盖原有修炼数据且不能恢复`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let userData = localStorage.getItem('data');
          userData = userData ? JSON.parse(userData) : {};
          userData.userUltimate = Object.assign({ decoBuff: userData.decoBuff }, this.setUlti(userData.chefGot));

          localStorage.setItem('data', JSON.stringify(userData));
          that.getUserData();
          setTimeout(() => {
            if (userData.userUltimate.Partial.id.length > 0) {
              this.$refs.userPartial.initOption();
            } else {
              this.$refs.userPartial.clear();
            }
            if (userData.userUltimate.Self.id.length > 0) {
              this.$refs.userSelf.initOption();
            } else {
              this.$refs.userSelf.clear();
            }
          }, 50);
        });
      },
      emptyUserUltimate() {
        const that = this;
        that.$confirm(`是否确定清空个人修炼数据？此操作会清空原有修炼/装饰加成数据且不能恢复（不影响已有厨师菜谱数据）`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.userUltimate = {
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
          that.$refs.userPartial.clear();
          that.$refs.userSelf.clear();
        });
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
          if (arr[1].indexOf('-') > -1) { // 如果是菜谱
            this.calRepEx[arr[1]] = this.defaultEx;
          }
        }
      },
      hasRep(pos) { // 判断某个厨师位是否有菜谱
        let hasRep = 0;
        for (let i of [1, 2, 3]) { // 判断是否有菜谱
          if (this.calRep[`${pos}-${i}`].id[0]) {
            hasRep = 1;
            break;
          }
        }
        return hasRep;
      },
      goToConfig() {
        this.showBack = true;
        this.navId = 8;
      },
      initCalRepSearch() {
        this.calReps = this.calRepsAll.filter(item => {
          let f_got = !this.calShowGot || this.repGot[item.id];
          return f_got && (this.checkKeyword(this.calKeyword, item.name) || this.checkKeyword(this.calKeyword, item.materials_search) || this.checkKeyword(this.calKeyword, item.origin));
        });
        if (this.sort.calRep.order) {
          this.$refs.calRepsTable.sort(this.sort.calRep.prop, this.sort.calRep.order);
        }
        this.calRepsCurPage = 1;
        this.calRepsPage = this.calReps.slice(0, this.calRepsPageSize);
      },
      compareObj(objA, objB) {
        return JSON.stringify(objA) == JSON.stringify(objB);
      },
      recalLimit() {
        for (let key in this.calRepCnt) {
          const rep = this.calRep[key].row[0];
          const cnt = this.calRepCnt[key];
          const limit_arr = [0, 40, 30, 25, 20, 15];
          if (rep) { // 有菜谱
            let limit = this.ulti[`MaxLimit_${rep.rarity}`] + limit_arr[rep.rarity] + (rep[`chef_${key.slice(0,1)}`].limitBuff || 0);
            if (this.customRule && this.customRule.skill && this.customRule.skill.MaxLimit) {
              limit += Number(this.customRule.skill.MaxLimit[rep.rarity]) || 0;
            }
            if (cnt > limit) {
              this.calRepCnt[key] = limit;
            }
          }
        }
      },
      setDiskList(key) {
        const chef = this.calChef[key].row[0];
        const chefId = chef ? chef.id : 0;
        // 厨师没发生变化
        if (this.lastCalChef[key] == chefId) {
          return;
        }
        this.lastCalChef[key] = chefId;
        // 遗玉列表清空，已选遗玉清空，心法盘等级重置为1
        let len = this.calAmberList[key].length;
        this.calAmberList[key] = [];
        this.calAmber[key] = [];
        this.calDiskLevel[key] = { max: 1, current: 1, last: 1 };
        this.lastCalAmber[key] = [];
        setTimeout(() => this.getCalRepLimit(), 100)
        if (chef) {
          for (let idx = 0; idx < len; idx++) {
            this.$refs[`calAmber_${key}_${idx}`][0].clear();
          }
          // 设置心法盘等级上限
          this.calDiskLevel[key].max = chef.disk.maxLevel;
          // 设置列表
          for (let type of chef.disk.info) {
            this.calAmberList[key].push(deepCopy(this[`calAmberOrigin${type}`]));
          }
          // 如果设置了心法盘默认满级
          if (this.defaultDiskMax) {
            this.calDiskLevel[key].current = chef.disk.maxLevel;
            this.handleDiskLevelChange(key);
          }
        }
      },
      handleDiskLevelChange(key) {
        let max = this.calDiskLevel[key].max;
        let val = this.calDiskLevel[key].current;
        let last = this.calDiskLevel[key].last;
        if (typeof val == 'string') {
          val = val.replace(/\./g, '');
          val = val.replace(/\-/g, '');
          val = Number(val);
        }
        val = val > max ? max : (val < 1 ? 1 : val);
        this.calDiskLevel[key].current = val;
        if (val != last) {
          // 心法盘等级变化，重设下拉框的subName
          let calAmberList = deepCopy(this.calAmberList[key]);
          calAmberList.forEach(list => {
            list.forEach(a => {
              a.subName = a.skill_detail_list[val - 1];
              a.subName_origin = a.subName;
            })
          });
          this.calAmberList[key] = calAmberList;
          // 强刷组件
          for (let idx in this.calAmberList[key]) {
            this.$nextTick(()=>{
              this.$refs[`calAmber_${key}_${idx}`][0].initOption();
            })
          }
          this.calDiskLevel[key].last = val;
          // 判断当前是否有装备遗玉
          let ambers = [];
          this.calAmber[key].forEach(a => {
            if (a && a.id[0]) {
              ambers.push(a.id[0]);
            }
          });
          // 如果有装备遗玉，重算分数
          if (ambers.length > 0) {
            this.getCalChefShow(key);
            setTimeout(() => this.handlerChef(key), 100)
          }
        }
      },
      handleCalAmberChange(key, idx) {
        let amber = this.calAmber[key][idx] ? this.calAmber[key][idx].row[0] : null;
        const amberId = amber ? amber.id : 0;
        // 遗玉发生变化，调用厨师处理
        if (amberId != this.lastCalAmber[key][idx]) {
          this.getCalChefShow(key);
          setTimeout(() => this.handlerChef(key), 100)
          this.lastCalAmber[key][idx] = amberId;
        }
      },
    },
    watch: {
      screenHeight(val) {
        if (this.originHeight - val > 150) {
          this.isOriginHei = false;
        } else {
          this.isOriginHei = true;
          this.tableHeight = window.innerHeight - 122 - this.extraHeight;
          this.boxHeight = window.innerHeight - 50 - this.extraHeight;
          this.chartHeight = window.innerHeight - 390 - this.extraHeight;
        }
        if (this.originHeight - val > 0) {
          $("#customRuleBox").css("bottom", val - this.originHeight);
        } else {
          $("#customRuleBox").css("bottom", 0);
        }
      },
      extraHeight(val) {
        localStorage.setItem('extraHeight', val);
        $('.extra-header').css('height', val);
        $('.left-bar-header').css('padding-top', val + 5);
        $('.right-bar-body').css('padding-top', val + 10);
        this.tableHeight = window.innerHeight - 122 - val;
        this.boxHeight = window.innerHeight - 50 - val;
        this.chartHeight = window.innerHeight - 390 - val;
      },
      leftBar(val) {
        if (val) {
          setTimeout(() => {
            $('.left-bar-header').css('padding-top', this.extraHeight + 5);
          }, 10);
        }
      },
      repCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
          });
        }
      },
      calChef: {
        deep: true,
        handler() {
          this.getCalChefShow();
          let i = [];
          for (let c in this.calChef) {
            if (this.calChef[c].id && this.calChef[c].id.length > 0) {
              i.push(this.calChef[c].id[0]);
            }
          }
          this.onSiteChef = i;
        }
      },
      calEquip: {
        deep: true,
        handler() {
          this.getCalChefShow();
        }
      },
      calCondiment: {
        deep: true,
        handler() {
          this.getCalChefShow();
        }
      },
      calRepCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.calRepsTable.doLayout();
          }
          });
        }
      },
      userNav() {
        this.saveUserData();
      },
      showDetail() {
        this.saveUserData();
      },
      repFilter: {
        deep: true,
        handler() {
          this.initRep();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
          });
        }
      },
      planList: {
        deep: true,
        handler() {
          this.saveUserData();
        }
      },
      repChef: {
        deep: true,
        handler(val) {
          this.initRep();
          this.$nextTick(()=>{
            if (this.tableShow) {
              this.$refs.recipesTable.doLayout();
            }
          });
          if (val.id && val.id.length == 1) { // 只选中了一个厨子的情况，生成修炼任务列表
            const chefId = val.id[0];
            const chef = this.data.chefs.find(c => c.chefId == chefId);
            this.chefs_task_list = chef.ultimateGoalDetail.map(t => {
              return {
                id: t.questId,
                name: t.goal,
                conditions: t.conditions,
              };
            });
          } else {
            this.chefs_task_list = [];
            if (this.repChefTask.id.length > 0) { // 如果已选了任务，重置任务相关的筛选
              this.repChefTask = { id: [], row: [] };
              this.resetTask();
            }
            if (val.id && val.id.length == 0) {
              this.partial_skill = { id: [], row: [] };
              this.repChefEquip = { id: [], row: [] };
            }
          }
        }
      },
      chefCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
              this.$refs.chefsTable.doLayout();
            }
          });
        }
      },
      chefFilter: {
        deep: true,
        handler() {
          this.initChef();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.chefsTable.doLayout();
          }
          });
        }
      },
      chefRep: {
        deep: true,
        handler() {
          this.initChef();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.chefsTable.doLayout();
          }
          });
        }
      },
      partial_skill: {
        deep: true,
        handler() {
          this.initChef();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.chefsTable.doLayout();
          }
          });
          if (this.navId == 1 && !this.refreshFlag) { // 异常丑陋的解决方式，用于强刷额外上场技能的子组件
            this.time2 = new Date().getTime();
            this.refreshFlag = true;
            setTimeout(() => {
              this.refreshFlag = false;
            });
          } else if (this.navId == 2 && !this.refreshFlag) {
            this.time1 = new Date().getTime();
            this.refreshFlag = true;
            setTimeout(() => {
              this.refreshFlag = false;
            });
          }
        }
      },
      equipCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.equipsTable.doLayout();
          }
          });
        }
      },
      equipFilter: {
        deep: true,
        handler() {
          this.initEquip();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.equipsTable.doLayout();
          }
          });
        }
      },
      amberCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.ambersTable.doLayout();
          }
          });
        }
      },
      amberFilter: {
        deep: true,
        handler() {
          this.initAmber();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.ambersTable.doLayout();
          }
          });
        }
      },
      condimentCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.condimentsTable.doLayout();
          }
          });
        }
      },
      condimentFilter: {
        deep: true,
        handler() {
          this.initCondiment();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.condimentsTable.doLayout();
          }
          });
        }
      },
      decorationCol: {
        deep: true,
        handler() {
          this.saveUserData();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.decorationsTable.doLayout();
          }
          });
        }
      },
      decorationFilter: {
        deep: true,
        handler() {
          this.initDecoration();
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.decorationsTable.doLayout();
          }
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
          this.$nextTick(()=>{
            this.$refs.mapsTable.doLayout();
          });
        }
      },
      userUltimate: {
        deep: true,
        handler(val) {
          this.userUltimateChange = true;
          this.calUltimateChange = true;
          const userUltimate = {};
          for (const key in val) {
            if (typeof val[key] == 'string') {
              userUltimate[key] = Number(val[key]);
            } else {
              userUltimate[key] = JSON.parse(JSON.stringify(val[key]));
            }
          }
          this.ulti = userUltimate;
          this.saveUserData();
        }
      },
      calChefShow: {
        deep: true,
        handler(val) {
          setTimeout(() => {
            let buff_time = 100;
            for (let key in val) {
              buff_time += (val[key].time_buff || 0);
            }
            for (let key in val) {
              if (!this.compareObj(val[key], this.calChefShowLast[key])) {
                if (val[key].id) {
                  this.handlerChef(key);
                } else {
                  // 如果厨子卸下来了，清除在场技能
                  this.onSiteEffect[key] = [];
                  this.calReps_origin[key] = deepCopy(this.calRepDefaultSort).map(r => {
                    delete r[`chef_${key}`]
                    return r;
                  })
                  this.initCalRepList(key);
                  setTimeout(() => this.getCalRepLimit(), 100)
                }
              }
            }
            if (buff_time != this.lastBuffTime && this.calType.id[0] == 0) { // 正常营业，时间加成发生变化，重算时间
              this.lastBuffTime = buff_time;
              const rep = this.calRepsAll.map(r => {
                r.buff_time = buff_time;
                r.time_last = Math.ceil((r.time * buff_time * 100) / 10000);
                r.time_show = this.formatTime(r.time_last);
                r.gold_eff = Math.floor(r.price_buff * 3600 / r.time_last);
                for (let key in val) {
                  if (val[key].id) {
                    r[`chef_${key}`].gold_eff = Math.floor(r[`chef_${key}`].price_buff * 3600 / r.time_last);
                    r[`gold_eff_chef_${key}`] = r[`chef_${key}`].gold_eff;
                  }
                }
                return r;
              });
              let show = this.calSortMap[this.calSort].normal.show || this.calSortMap[this.calSort].normal.prop;
              this.calRepDefaultSort = rep.map(r => {
                r.subName = String(r[show]) + (r.unknowBuff ? ' 规则未知' : '') + (r.NotSure ? ' 倍数可能不对' : '');
                return r;
              });
              this.calRepsAll = rep;
              rep.sort(this.customSort(this.calSortMap[this.calSort].normal));
              for (let key in val) {
                if (val[key].id) {
                  this.calRepSort(key);
                } else {
                  this.calReps_origin[key] = JSON.parse(JSON.stringify(this.calRepDefaultSort));
                  this.initCalRepList(key);
                }
              }
            }
            this.calChefShowLast = JSON.parse(JSON.stringify(val));
          }, 100);
        }
      },
      onSiteEffect: {
        deep: true,
        handler(val) {
          if (!this.compareObj(this.onSiteEffect, this.onSiteEffectLast)) {
            for (let key in this.calChefShow) {
              if (this.calChefShow[key].id) {
                this.handlerChef(key);
              }
            }
          }
          this.onSiteEffectLast = JSON.parse(JSON.stringify(this.onSiteEffect));
        }
      },
      calRepEx: {
        deep: true,
        handler() {
          this.getCalRepShow();
        }
      },
      calRepCondi: {
        deep: true,
        handler() {
          setTimeout(() => {
            this.getCalRepShow();
          }, 10);
        }
      },
      calRepsAll: {
        deep: true,
        handler(val) {
          this.initCalRepSearch();
        }
      },
      calType: {
        deep: true,
        handler(val) {
          if (val.id[0] != 0) {
            this.calSort = 1;
          }
          this.calLoad = true;
          this.calHidden = true;
        }
      },
      calRep: {
        deep: true,
        handler() {
          this.getCalRepShow();
          let repCntMap = {};
          for (let key in this.calRep) {
            if (this.calRep[key].id && this.calRep[key].id.length > 0) {
              repCntMap[this.calRep[key].id[0]] = key;
            }
          }
          this.repCntMap = repCntMap;
        }
      },
      calRepCnt: {
        deep: true,
        handler(val) { // 如果份数发生变化，重新计算最大份数
          this.getCalRepShow();
          const rule = this.calType.row[0];
          if (rule.MaterialsLimit) { // 如果有食材数量限制
            this.getCalRepLimit();
            let remain = JSON.parse(JSON.stringify(this.materialsAll));
            let reps = {};
            for (let key in val) { // 计算食材剩余
              let i = Number(key.split('-')[0]) - 1;
              let j = Number(key.split('-')[1]) - 1;
              reps[key] = this.calRepShow[i][j];
              if (this.calRepShow[i][j].materials && val[key] > 0) {
                for (let m of this.calRepShow[i][j].materials) {
                  remain[m.material] -= (m.quantity * val[key]);
                }
              }
            }
            this.materialsRemain = remain;
            setTimeout(() => {
              let calRepsAll = this.calRepsAll.map(r => {
                // 上限的限制
                let min = r.limit_origin;
                // 食材&规则的限制
                let limit_mater = rule.DisableMultiCookbook ? 1 : 500;
                for (let m of r.materials) {
                  let lim = Math.floor(remain[m.material] / m.quantity);
                  limit_mater = (limit_mater < lim ? limit_mater : lim);
                }
                // 最终无加成情况的份数
                let limit = Math.min(limit_mater, min);
                r.limit = limit;
                r.limit_mater = limit_mater;
                r.price_total = r.limit * r.price_buff;

                for (let i = 1; i < 4; i++) {
                  if (this.calChef[i].id[0]) {
                    // 带上上限加成后的份数
                    limit = Math.min(limit_mater, min + r[`chef_${i}`].limitBuff);
                    r[`chef_${i}`].limit = limit;
                    r[`chef_${i}`].price_total = r[`chef_${i}`].price_buff * limit;
                    r[`price_chef_${i}`] = r[`chef_${i}`].price_buff * limit;
                  }
                }
                return r;
              });
              calRepsAll.sort(this.customSort(this.calSortMap[this.calSort].normal));
              this.calRepsAll = calRepsAll;
              let show = this.calSortMap[this.calSort].normal.show || this.calSortMap[this.calSort].normal.prop;
              this.calRepDefaultSort = this.calRepsAll.map(r => {
                r.subName = String(r[show]) + (r.unknowBuff ? ' 规则未知' : '') + (r.NotSure ? ' 倍数可能不对' : '');
                return r;
              });
              for (let key of [1, 2, 3]) { // 排序
                let flag = false;
                for (let j of [1, 2, 3]) {
                  if (!this.calRep[`${key}-${j}`].id[0]) {
                    flag = true;
                  }
                }
                if (flag) {
                  if (this.calChef[key].id[0]) {
                    this.calRepSort(key);
                  } else {
                    this.calReps_origin[key] = JSON.parse(JSON.stringify(this.calRepDefaultSort));
                    this.initCalRepList(key);
                  }
                }
              }
            }, 50);
          }
          for (let key in this.calChef) { // 循环检查在场厨师
            let row = this.calChef[key].row;
            if (row && row[0] && (row[0].effect_condition.indexOf('ExcessCookbookNum') > -1 || row[0].effect_condition.indexOf('FewerCookbookNum') > -1)) { // 如果有会根据份数变化的
              this.handlerChef(key); // 重新计算加成
            }
          }
        }
      },
      hideSuspend() {
        this.saveUserData();
      },
      hiddenMessage() {
        this.saveUserData();
      },
      defaultEx(val) {
        this.saveUserData();
        let rst = {};
        for (let key in this.calRepEx) {
          if (!this.calRep[key].id[0]) {
            rst[key] = val;
          } else {
            rst[key] = this.calRepEx[key];
          }
        }
        this.calRepEx = rst;
      },
      defaultDiskMax(val) {
        this.saveUserData();
      },
      hiddenDisk(val) {
        this.saveUserData();
      },
      calKeyword() {
        this.initCalRepSearch();
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
            $('.right-bar-body').css('padding-top', this.extraHeight + 10);
            $('.el-drawer__body').scrollTop(0);
          }, 100);
        }
      },
      mapType() {
        this.initMap();
      },
      repKeyword() {
        this.initRep();
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
        });
      },
      guestKeyword() {
        this.initRep();
        this.$nextTick(()=>{
          if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
        });
      },
      questsType() {
        this.initQuests();
      },
      questsKeyword() {
        this.initQuests();
      },
      navId(val) {
        if (val != 8) {
          this.showBack = false;
        }
        if (val === 1) {
          if (this.recipes.length == 0) {
            this.initRep();
          }
          if (this.chefUltimate && !this.chefUseAllUltimate && this.userUltimateChange) {
            this.userUltimateChange = false;
            this.initChef();
          }
          this.$nextTick(()=>{
            if (this.tableShow) {
            this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
          }
            this.$refs.recipesTable.bodyWrapper.scrollLeft = 0;
            if (this.tableShow) {
            this.$refs.recipesTable.doLayout();
          }
          });
        } else if (val == 2) {
          if (this.chefs.length == 0 || (this.chefUltimate && !this.chefUseAllUltimate && this.userUltimateChange)) {
            this.userUltimateChange = false;
            this.initChef();
          }
          this.$nextTick(()=>{
            if (this.tableShow) {
              this.$refs.chefsTable.bodyWrapper.scrollTop = 0;
              this.$refs.chefsTable.bodyWrapper.scrollLeft = 0;
              this.$refs.chefsTable.doLayout();
            }
          });
        } else if (val == 3) {
          if (this.equips.length == 0) {
            this.initEquip();
          }
          this.$nextTick(()=>{
            this.$refs.equipsTable.bodyWrapper.scrollTop = 0;
            this.$refs.equipsTable.bodyWrapper.scrollLeft = 0;
            if (this.tableShow) {
            this.$refs.equipsTable.doLayout();
          }
          });
        } else if (val == 12) {
          if (this.ambers.length == 0) {
            this.initAmber();
          }
          this.$nextTick(()=>{
            this.$refs.ambersTable.bodyWrapper.scrollTop = 0;
            this.$refs.ambersTable.bodyWrapper.scrollLeft = 0;
            if (this.tableShow) {
            this.$refs.ambersTable.doLayout();
          }
          });
        } else if (val == 10) {
          if (this.condiments.length == 0) {
            this.initCondiment();
          }
          this.$nextTick(()=>{
            this.$refs.condimentsTable.bodyWrapper.scrollTop = 0;
            this.$refs.condimentsTable.bodyWrapper.scrollLeft = 0;
            if (this.tableShow) {
            this.$refs.condimentsTable.doLayout();
          }
          });
        } else if (val == 4) {
          if (this.decorations.length == 0) {
            this.initDecoration();
          }
          this.$nextTick(()=>{
            this.$refs.decorationsTable.bodyWrapper.scrollTop = 0;
            this.$refs.decorationsTable.bodyWrapper.scrollLeft = 0;
            if (this.tableShow) {
            this.$refs.decorationsTable.doLayout();
          }
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
          }
          if (this.calUltimateChange && !this.calHidden) {
            this.calUltimateChange = false;
            this.getCalChefShow();
            this.recalLimit();
            setTimeout(() => {
              if (this.calType.row[0] && this.calType.row[0].MaterialsLimit) {
                this.getCalRepLimit();
              }
              this.initCalRep();
              this.lastBuffTime = 100;
            }, 50);
          }
          if ((this.repGotChange || this.chefGotChange) && !this.calHidden && this.calShowGot) {
            this.$message('已有厨师菜谱发生了变化，需要重新加载计算器获取最新数据~');
            this.chefGotChange = false;
            this.repGotChange = false;
          }
        }
      },
      calShowGot(val) {
        this.saveUserData();
        if (!this.calHidden) {
          this.initCalRepList();
          this.initCalRepSearch();
          this.initCalChefList();
        }
      },
      customRuleShow(val) {
        if (!val && this.customRuleChange) {
          this.initCal();
        }
        if (val && window.innerWidth < 669) {
          $("#customRuleBox input").on("focus", function() {
            this.scrollIntoView();
          });
        }
      },
      customRule: {
        deep: true,
        handler() {
          this.customRules[this.custom_rule_id] = JSON.parse(JSON.stringify(this.customRule));
          this.saveUserData();
          if (this.customRuleShow) {
            this.customRuleChange = true;
          }
        }
      },
      chefGot: {
        deep: true,
        handler() {
          this.chefGotChange = true;
        }
      },
      repGot: {
        deep: true,
        handler() {
          this.repGotChange = true;
        }
      }
    }
  });
});
