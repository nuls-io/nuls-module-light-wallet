<template>
  <div>
    <div class="bottom">
      <div class="w1200 font14">
        <div class="left fl">
          <p class="fl">
            {{$t('bottom.serviceNode')}}:
            <u class="click" @click="toUrl('nodeService')">{{serviceUrls}}</u>
          </p>
          <p class="fr">{{$t('bottom.nodeHeight')}}: {{mainHeightInfo.height}}/{{heightInfo.height}}</p>
        </div>
        <div class="right fr">
          <label class="clicks">{{$t('bottom.agreement')}}</label>
          <label class="clicks">{{$t('bottom.policy')}}</label>
          <!--<label>Alpha 2.0.1</label>-->
          <label class="click" @click="checkUpdate">Alpha 2.0.1</label>
        </div>
      </div>
    </div>
    <el-dialog :title="$t('bottom.updateWallet')" width="35rem"
               :visible.sync="updateDialogVisible"
               :show-close="tips.type===1 || tips.type===4"
               :close-on-press-escape="false"
               :close-on-click-modal="false">
      <div class="upload">
        <div class="upload-tips">{{$t('bottom.Tips')}}: {{$t('TipsType.'+tips.type) }}</div>
        <div class="upload-percent" v-if="downloadPercent !==0 ">
          <el-progress :text-inside="true" :stroke-width="18" :percentage="downloadPercent" status="success">
          </el-progress>
        </div>
        <div class="upload-bt" v-if="tips.type === 3">
          <el-button type="info" @clcik="afterRun">{{$t('bottom.Backstage')}}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  import axios from 'axios'
  import {IS_DEV} from '@/config.js'

  export default {
    name: "bottom-bar",
    data() {
      return {
        mainHeightInfo: [],//最新主网高度
        heightInfo: [],//最新高度
        serviceUrls: localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")).urls : 'https://alpha.wallet.nuls.io/api',
        updateDialogVisible: false,//更新弹框
        tips: {},//提示信息
        downloadPercent: 0,//下载进度
      }
    },
    created() {
      this.getBestBlockHeader();
      this.getMainHeader();
      this.serviceUrls = localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")).urls : 'http://apitn1.nulscan.io/';
      setInterval(() => {
        this.serviceUrls = localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")).urls : 'http://apitn1.nulscan.io/';
      }, 500);
    },
    mounted() {
      setInterval(() => {
        this.getBestBlockHeader();
        this.getMainHeader();
      }, 10000);
    },
    watch: {
      serviceUrls(val, old) {
        if (val) {
          if (val !== old && old) {
            this.getBestBlockHeader();
          }
        }
      }
    },
    methods: {

      /**
       * 获取主网最新高度（浏览器高度）
       */
      getMainHeader() {
        const url = IS_DEV ? 'http://apitn1.nulscan.io/' : 'http://apitn1.nulscan.io/';
        const params = {"jsonrpc": "2.0", "method": "getBestBlockHeader", "params": [2], "id": 5898};
        axios.post(url, params)
          .then((response) => {
            //console.log(response);
            if (response.data.hasOwnProperty("result")) {
              this.mainHeightInfo = response.data.result;
            } else {
              this.mainHeightInfo = {height: 0};
            }
          })
          .catch((error) => {
            this.mainHeightInfo = {height: 0};
            console.log("getBestBlockHeader:" + error)
          })
      },

      /**
       * 获取最新高度
       */
      getBestBlockHeader() {
        this.$post('/', 'getBestBlockHeader', [])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              this.heightInfo = response.result;
            } else {
              this.heightInfo = {height: 0};
            }
          })
          .catch((error) => {
            this.heightInfo = {height: 0};
            console.log("getBestBlockHeader:" + error)
          })
      },

      /**
       * 检查更新
       **/
      async checkUpdate() {
        this.updateDialogVisible = true;
        this.tips = {};
        this.downloadPercent = 0;
        const _this = this;
        _this.$electron.ipcRenderer.send("checkForUpdate");
        await _this.$electron.ipcRenderer.on("message", (event, text) => {
          _this.tips = text;
        });
        _this.$electron.ipcRenderer.on("downloadProgress", (event, progressObj) => {
          _this.downloadPercent = Number(progressObj.percent.toFixed(2)) || 0;
        });
        _this.$electron.ipcRenderer.on("isUpdateNow", () => {
          _this.$electron.ipcRenderer.send("isUpdateNow");
        });
      },

      /**
       * 后台运行
       **/
      afterRun() {
        this.updateDialogVisible = false;
      },

      /**
       * 连接跳转
       * @param name
       */
      toUrl(name) {
        //console.log(name)
        this.$router.push({
          name: name
        })
      },
    }
  }
</script>

<style lang="less">
  @import "./../assets/css/style";

  .bottom {
    height: 60px;
    border-top: 1px solid @Dcolour;
    position: fixed;
    line-height: 60px;
    bottom: 0;
    background-color: @Bcolour;
    width: 100%;
    @media screen and (max-width: 1000px) {
      height: 4rem;
      font-size: 0.7rem;
      line-height: 1rem;
    }
    .w1200 {
      .left {
        width: 50%;
        line-height: 60px;
        @media screen and (max-width: 1000px) {
          width: 100%;
          margin: 0.5rem 0 0 0.5rem;
          p {
            margin: 0;
            float: none;
            display: block;
          }
        }
      }
      .right {
        width: 40%;
        line-height: 60px;
        text-align: right;
        @media screen and (max-width: 1000px) {
          width: 100%;
          float: none;
        }
        label {
          padding: 0 10px;
          @media screen and (max-width: 1000px) {
            padding: 0 0.5rem;
            font-size: 0.7rem;
            line-height: 1rem;
          }
        }
      }
    }

  }
</style>
