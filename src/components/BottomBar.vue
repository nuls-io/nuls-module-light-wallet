<template>
  <div>
    <div class="bottom">
      <div class="w1200 font14">
        <div class="left fl">
          <p class="fl">
            {{$t('bottom.serviceNode')}}:
            <u class="click" @click="toUrl('nodeService')">{{serviceUrls.urls}}</u>
          </p>
        </div>
        <div class="right fr">
          {{$t('bottom.nodeHeight')}}: {{heightInfo.networkHeight}}/{{heightInfo.localHeight}}
          <!--<label class="click" @click="checkUpdate">Alpha 2.0.1</label>-->
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
        <div class="upload-bt" v-if="tips.type === 3" v-show="false">
          <el-button type="info" @clcik="afterRun">{{$t('bottom.Backstage')}}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  import nuls from 'nuls-sdk-js'
  import axios from 'axios'
  import {defaultUrl} from '@/config.js'
  import {chainID, chainIdNumber, addressInfo, timesDecimals} from '@/api/util'

  export default {
    name: "bottom-bar",
    data() {
      return {
        heightInfo: [],//高度信息
        serviceUrls: localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")) : defaultUrl,
        updateDialogVisible: false,//更新弹框
        tips: {},//提示信息
        downloadPercent: 0,//下载进度
      }
    },
    created() {
      this.getHeaderInfo();
      setInterval(() => {
        this.serviceUrls = localStorage.hasOwnProperty("urls") ? JSON.parse(localStorage.getItem("urls")) : defaultUrl;
      }, 500);
    },
    mounted() {
      setInterval(() => {
        this.getHeaderInfo();
        this.getAddressInfo();
      }, 10000);
    },
    watch: {},
    methods: {

      /**
       * 获取主网最新高度和本地高度
       */
      getHeaderInfo() {
        const url = localStorage.hasOwnProperty('urls') ? JSON.parse(localStorage.getItem('urls')).urls : 'http://192.168.1.40:18003/';
        const params = {"jsonrpc": "2.0", "method": "getInfo", "params": [chainID()], "id": 5898};
        axios.post(url, params)
          .then((response) => {
            //console.log(response.data);
            if (response.data.hasOwnProperty("result")) {
              this.heightInfo = response.data.result;
            } else {
              this.heightInfo = {localHeight: 0, networkHeight: 0};
            }
          })
          .catch((error) => {
            this.heightInfo = {localHeight: 0, networkHeight: 0};
            console.log("getInfo:" + error)
          })
      },

      /**
       * 获取地址网络信息
       * @param addressInfo
       **/
      async getAddressInfo() {
        let addressInfos = addressInfo(1);
        let addressList = addressInfo(0);
        if (addressInfos) {
          await this.$post('/', 'getAccount', [addressInfos.address])
            .then((response) => {
              //console.log(response);
              if (response.hasOwnProperty("result")) {
                for (let item of addressList) {
                  if (item.address === addressInfos.address) {
                    item.alias = response.result.alias;
                    item.balance = timesDecimals(response.result.balance);
                    item.consensusLock = timesDecimals(response.result.consensusLock);
                    item.totalReward = timesDecimals(response.result.totalReward);
                    item.tokens = [];
                    item.chainId = nuls.verifyAddress(item.address).chainId;
                  }
                }
                localStorage.setItem(chainIdNumber(), JSON.stringify(addressList))
              }
            })
            .catch((error) => {
              console.log("getAccount:" + error);
            });
        }
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
        console.log(this.updateDialogVisible);
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
