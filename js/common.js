// 判断是否是数组：
const isArray = (arr) => {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

// 判断是否是对象：
const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null;
};

// 数组或对象的深拷贝方法1
const deepCopy = (val) => {
  let oVal = isArray(val) ? [] : {};
  for (let v in val) {
      if (isObject(val[v])) {
          // 这里是深拷贝的关键所在（递归调用）
          oVal[v] = deepCopy(val[v]);
      } else {
          oVal[v] = val[v];
      };
  };
  return oVal;
};

function judgeEff(eff) {
  return (eff.type.slice(0, 3) == 'Use' || eff.type == 'Gold_Gain' || eff.type.slice(-5) == 'Price' || eff.type.slice(-5) == 'Limit' || eff.type.slice(0, 10) == 'BasicPrice');
}