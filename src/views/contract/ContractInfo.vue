<template>
  <div class="contract-info bg-gray">

    <div class="bg-white">
      <div class="w1200">
        <BackBar backTitle="合约"></BackBar>
        <h3 class="title">{{contractAddress}}<i class="iconfont icon-fuzhi clicks"></i></h3>
      </div>
    </div>

    <div class="w1200 mt_20">
      <div class="card_long">
        <h5 class="card-title font18">基本信息</h5>
        <ul>
          <li>余额<label>{{contractInfo.balance}}<span class="fCN">NULS</span></label></li>
          <li>交易次数<label>{{contractInfo.txCount}}</label></li>
          <li>
            创建者
            <label>
              <u class="click" @click="toUrl('consensusList')">{{contractInfo.creater}}</u>
              at TxID
              <u class="click" @click="toUrl('consensusList')">{{contractInfo.createTxHashs}}</u>
            </label>
          </li>
          <li>代币<label>{{contractInfo.symbol}}</label></li>
        </ul>
      </div>
      <div class="cb"></div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="交易记录" name="first">
          <SelectBar v-model="contractsTypeRegion" :typeOptions="contractsStatusOptions" typeName="type"
                     @change="changeType">
          </SelectBar>

          <el-table :data="contractTxData" stripe border style="width: 100%;margin-top: 14px">
            <el-table-column label="" width="30">
            </el-table-column>
            <el-table-column prop="height" label="交易类型" width="180" align="left">
              <template slot-scope="scope">
                <span class="cursor-p click" @click="toUrl('blockInfo',scope.row.blockHeight)">{{ scope.row.blockHeight }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="height" label="来源" width="180" align="left">
              <template slot-scope="scope">
                <span class="cursor-p click" @click="toUrl('blockInfo',scope.row.blockHeight)">{{ scope.row.blockHeight }}</span>
              </template>
            </el-table-column>
            <el-table-column label="TXID" min-width="280" align="left">
              <template slot-scope="scope">
                <span class="cursor-p click"
                      @click="toUrl('transactionInfo',scope.row.txHash)">{{ scope.row.txHashs }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="time" :label="$t('public.time')" width="180" align="left">
            </el-table-column>
            <el-table-column label="结果" width="180" align="left">
              <template slot-scope="scope">{{scope.row.fee}}</template>
            </el-table-column>
          </el-table>
          <div class="pages">
            <div class="page-total">
              {{$t('public.display')}} {{pageIndex-1 === 0 ? 1 : (pageIndex-1) *pageSize}}-{{pageIndex*pageSize}}
              {{$t('public.total')}} {{pageTotal}}
            </div>
            <el-pagination v-show="pageTotal > pageSize" @current-change="contractTxPages" class="fr"
                           :current-page="pageIndex"
                           :page-size="pageSize"
                           background
                           layout=" prev, pager, next, jumper"
                           :total="pageTotal">
            </el-pagination>
          </div>

        </el-tab-pane>
        <!--<el-tab-pane label="合约代码" name="second">
          <CodeInfo></CodeInfo>
        </el-tab-pane>-->
        <el-tab-pane label="合约方法" name="third">
          <el-table :data="modeList" stripe border style="width: 100%" class="mzt_20">
            <el-table-column label="" width="30">
            </el-table-column>
            <el-table-column prop="name" label="Method" width="280" align="left">
            </el-table-column>
            <el-table-column prop="height" label="Parameter" min-width="280" align="left">
              <template slot-scope="scope">
                <span v-for="item in scope.row.params" :key="item">{{item}}-</span>
              </template>
            </el-table-column>
            <el-table-column prop="returnType" label="Return Type" width="280" align="left">
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <el-tab-pane label="调用合约" name="fourth">
          <Call :modelList="modelData"></Call>
        </el-tab-pane>
      </el-tabs>

    </div>

  </div>

</template>

<script>
  import BackBar from '@/components/BackBar'
  import SelectBar from '@/components/SelectBar';
  import Call from './Call'
  import {timesDecimals, getLocalTime, superLong} from '@/api/util'

  export default {
    data() {
      return {
        activeName: 'first',
        contractAddress: this.$route.query.contractAddress,//合约地址
        contractInfo: {},//合约详情
        //合约交易类型
        contractsStatusOptions: [
          {value: 0, label: '0'},
          {value: 15, label: '15'},
          {value: 16, label: '16'},
          {value: 17, label: '17'},
          {value: 18, label: '18'},
        ],
        contractsTypeRegion: 0,

        //合约列表
        contractTxData: [],
        pageIndex: 1, //页码
        pageSize: 10, //每页条数
        pageTotal: 0,//总页数
        modeList: [],
        modelData: [],//合约方法列表

      };
    },
    created() {

    },
    mounted() {

      this.contractInfoByAddress(this.contractAddress);
      //定时获取地址
      this.contractAddressInterval = setInterval(() => {
        //this.contractsAddress= this.$route.query.contractAddress;
      }, 500)
    },
    beforeDestroy() {
      //离开界面清除定时器
      if (this.contractAddressInterval) {
        clearInterval(this.contractAddressInterval);
      }
    },
    components: {
      BackBar,
      SelectBar,
      Call
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      },

      /**
       * 合约详情根据合约地址
       * @param address
       **/
      async contractInfoByAddress(address) {
        await this.$post('/', 'getContract', [address])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result")) {
              response.result.createTxHashs = superLong( response.result.createTxHash, 5);
              response.result.balance = timesDecimals( response.result.balance);
              this.contractInfo = response.result;
              //this.modelData = response.result.methods;
            } else {
              this.$message({message: '获取合约详情失败:' + response.error, type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            this.$message({message: '获取合约详情异常:' + error, type: 'error', duration: 1000});
          });
      },

      /**
       *  根据数据类型排序
       **/
      changeType(type) {
        this.contractsTypeRegion = parseInt(type);
      },

      /**
       *  合约交易记录分页
       **/
      contractTxPages(val) {
        this.pageIndex = val;
      },

      /**
       * 连接跳转
       * @param name
       */
      toUrl(name, type = 0) {
        //console.log(name)
        if (type.toString() === '0') {
          this.$router.push({
            name: name
          });
        } else {
          //shell.openExternal(newUrl);
          window.open(name, '_blank');
        }
      },

    }
  };
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .contract-info {
    background-color: @Bcolour1;
    .card_long {
      height: 140px;
    }
    .el-tabs {
      margin: 30px auto 0;
    }
  }
</style>

