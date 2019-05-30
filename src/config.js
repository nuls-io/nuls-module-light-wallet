//开发模式
export const IS_DEV = process.env.NODE_ENV !== 'production';
//链ID
export const API_CHAIN_ID = 2;
//燃烧地址
export const API_BURNING_ADDRESS = 'tNULSeBaMgLW3Wrt8Eh8Av5MinETdiXhfGg61u';
//运行环境（true:正式环境，false:测试环境）
export const RUN_DEV = false;
//正式、测试网络的api
export let API_URL = localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")).urls : 'http://apitn1.nulscan.io/';
setInterval(() => {
  API_URL = localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")).urls : 'http://apitn1.nulscan.io/';
}, 500);
//请求最迟时间
export const API_TIME = IS_DEV ? '9000' : '8000';
//默认节点服务列表
export const defaultData = [
  {name: 'Official', urls: 'http://apitn1.nulscan.io/', delay: '10ms', state: 1, isDelete: false},
  {name: 'Official', urls: 'http://apitn2.nulscan.io/', delay: '10ms', state: 0, isDelete: false},
];
//浏览器地址
export const explorerUrl = 'http://alpha.nulscan.io/';
