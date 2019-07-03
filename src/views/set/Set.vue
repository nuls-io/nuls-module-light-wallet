<template>
  <div class="set bg-gray">
    <div class="bg-white">
      <div class="w1200">
        <h3 class="title">
          关  于
        </h3>
      </div>
    </div>
    <div class="w1200 mt_20 bg-white set_info">
       <div class="tc mzt_20">
         <h4 class="font24 mb_20">NULS Wallet</h4>
         <p class="font16">当前版本: 2.0.1</p>
         <p class="font16 yellow" v-show="tips.type !==4">最新版本: 2.0.2</p>
         <el-button type="success" @click="updateing" v-show="tips.type !==4">立即更新</el-button>
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

  export default {
    data() {
      return {
        updateDialogVisible: false,//更新弹框
        tips: {},//提示信息
        downloadPercent: 0,//下载进度
      };
    },
    created() {

    },
    mounted() {
      this.checkUpdate();
    },
    components: {

    },
    methods: {

      /**
       * 检查更新
       **/
      async checkUpdate() {
        const _this = this;
        _this.$electron.ipcRenderer.send("checkForUpdate");
        await _this.$electron.ipcRenderer.on("message", (event, text) => {
          _this.tips = text;
        });
      },

      /**
       * 检查更新
       **/
      async updateing() {
        this.updateDialogVisible = true;
        this.tips = {};
        this.downloadPercent = 0;
        const _this = this;
        _this.$electron.ipcRenderer.send("checkForUpdate");
        await _this.$electron.ipcRenderer.on("message", (event, text) => {
          _this.tips = text;
          console.log(event);
          console.log("99999");
          console.log(text)
        });
        /* _this.$electron.ipcRenderer.on("downloadProgress", (event, progressObj) => {
           _this.downloadPercent = Number(progressObj.percent.toFixed(2)) || 0;
         });
         _this.$electron.ipcRenderer.on("isUpdateNow", () => {
           _this.$electron.ipcRenderer.send("isUpdateNow");
         });*/
      },

      /**
       * 后台运行
       **/
      afterRun() {
        this.updateDialogVisible = false;
      },
    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";
  .set {
    .set_info {
      border: @BD1;
      min-height: 500px;
      p{
        line-height: 1.6rem;
      }
      .el-button{
        margin: 1rem 0 0 0;
        padding: 0.5rem;
        width: 7.5rem;
      }
    }
  }

</style>
