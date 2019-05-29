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
        <h5 class="card-title font18">
          基本信息
          <span class="font14 fr fred click" v-show="isCancel" @click="cancelContract">
            注销合约
          </span>
        </h5>
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
            <el-table-column prop="height" label="高度" width="180" align="left">
              <template slot-scope="scope">
                <span class="cursor-p click">{{ scope.row.blockHeight }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="height" label="交易类型" width="180" align="left">
              <template slot-scope="scope"><span>{{ $t('type.'+scope.row.type) }}</span></template>
            </el-table-column>
            <el-table-column label="TXID" min-width="280" align="left">
              <template slot-scope="scope">
                <span class="cursor-p click"
                      @click="toUrl('transactionInfo',scope.row.txHash)">{{ scope.row.txHashs }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="time" :label="$t('public.time')" width="180" align="left">
            </el-table-column>
            <el-table-column label="手续费" width="180" align="left">
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
                <span v-for="item in scope.row.params" :key="item.name">{{item.name}}-</span>
              </template>
            </el-table-column>
            <el-table-column prop="returnType" label="Return Type" width="280" align="left">
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <el-tab-pane label="调用合约" name="fourth" class="bg-white">
          <div class="w630" style="padding-bottom: 50px">
            <Call :modelList="modelData" :contractAddress="contractAddress"></Call>
          </div>
        </el-tab-pane>
      </el-tabs>

    </div>
    <Password ref="password" @passwordSubmit="passSubmit"></Password>
  </div>

</template>

<script>
  import nuls from 'nuls-sdk-js'
  import moment from 'moment'
  import BackBar from '@/components/BackBar'
  import SelectBar from '@/components/SelectBar';
  import Call from './Call'
  import {timesDecimals, getLocalTime, superLong} from '@/api/util'
  import {getNulsBalance, inputsOrOutputs, validateAndBroadcast} from '@/api/requestData'
  import Password from '@/components/PasswordBar'
  import * as config from '@/config.js'

  export default {
    data() {
      return {
        activeName: 'fourth',
        addressInfo: {},//账户信息
        contractAddress: this.$route.query.contractAddress,//合约地址
        contractInfo: {},//合约详情
        isCancel: false,
        //合约交易类型
        contractsStatusOptions: [
          {value: 0, label: '0'},
          {value: 15, label: '15'},
          {value: 16, label: '16'},
          {value: 17, label: '17'},
          {value: 18, label: '18'},
        ],
        contractsTypeRegion: 0,
        contractTxData: [],//合约交易列表
        pageIndex: 1, //页码
        pageSize: 10, //每页条数
        pageTotal: 0,//总页数
        modeList: [],//合约方法列表
        modelData: [],//合约方法列表

      };
    },
    created() {
      this.addressInfo = JSON.parse(sessionStorage.getItem(sessionStorage.key(0)));
      setInterval(() => {
        this.addressInfo = JSON.parse(sessionStorage.getItem(sessionStorage.key(0)));
      }, 500);
      this.getBalanceByAddress(this.addressInfo.address);
    },
    mounted() {
      this.contractInfoByAddress(this.contractAddress);
      this.contractTxList(this.pageIndex, this.pageSize, 0, this.contractAddress);
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
      Call,
      Password
    },
    watch: {
      addressInfo(val, old) {
        if (val.address !== old.address && old.address) {
          this.addressInfo = val;
          this.isCancel = this.addressInfo.address === this.contractInfo.creater;
          this.getBalanceByAddress(this.addressInfo.address);
        }
      }
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
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              response.result.createTxHashs = superLong(response.result.createTxHash, 5);
              response.result.balance = timesDecimals(response.result.balance);
              this.contractInfo = response.result;
              this.modelData = response.result.methods;
              this.modeList = response.result.methods;
              this.isCancel = this.addressInfo.address === this.contractInfo.creater
            } else {
              this.$message({message: '获取合约详情失败:' + response.error, type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            this.$message({message: '获取合约详情异常:' + error, type: 'error', duration: 1000});
          });
      },

      /**
       * 合约交易列表
       * @param address
       **/
      async contractTxList(pageIndex, pageSize, type, address) {
        await this.$post('/', 'getContractTxList', [pageIndex, pageSize, type, address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let item of response.result.list) {
                item.time = moment(getLocalTime(item.time * 1000)).format('YYYY-MM-DD HH:mm:ss');
                item.txHashs = superLong(item.txHash, 20);
                item.fee = timesDecimals(item.fee);
              }
              this.contractTxData = response.result.list;
              this.pageTotal = response.result.totalCount;
            } else {
              this.$message({message: '获取合约交易列表失败:' + response.error, type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            this.$message({message: '获取合约交易列表异常:' + error, type: 'error', duration: 1000});
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
       * 获取账户余额
       * @param address
       **/
      getBalanceByAddress(address) {
        getNulsBalance(address).then((response) => {
          if (response.success) {
            this.balanceInfo = response.data;
          } else {
            this.$message({message: this.$t('public.err2') + response, type: 'error', duration: 1000});
          }
        }).catch((error) => {
          this.$message({message: this.$t('public.err3') + error, type: 'error', duration: 1000});
        });
      },

      /**
       * 验证删除合约交易
       */
      async validateContractDelete(sender, contractAddress) {
        return await this.$post('/', 'validateContractDelete', [sender, contractAddress])
          .then((response) => {
            if (response.hasOwnProperty("result")) {
              return response.result;
            } else {
              return {success: false, data: response.error};
            }
          })
          .catch((error) => {
            return {success: false, data: error};
          });
      },

      /**
       * 注销合约
       **/
      cancelContract() {
        this.$refs.password.showPassword(true)
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        const pri = nuls.decrypteOfAES(this.addressInfo.aesPri, password);
        let pub = this.addressInfo.pub;
        const newAddressInfo = nuls.importByKey(2, pri, password);
        if (newAddressInfo.address === this.addressInfo.address) {

          let amount = 0;
          let transferInfo = {
            fromAddress: this.addressInfo.address,
            assetsChainId: config.API_CHAIN_ID,
            assetsId: 1,
            amount: amount,
            fee: 100000
          };
          let contractDelete = {
            chainId: 2,
            sender: this.addressInfo.address,
            contractAddress: this.contractAddress
          };

          let deleteValidateResult = await this.validateContractDelete(contractDelete.sender, contractDelete.contractAddress);
          if (!deleteValidateResult.success) {
            this.$message({message: "验证删除合约失败：" +deleteValidateResult.msg, type: 'error', duration: 3000});
            return;
          }
          let remark = '';
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 17);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 17, contractDelete);
          let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          //console.log(txhex);
          //验证并广播交易
          await validateAndBroadcast(txhex).then((response) => {
            if (response.success) {
              this.$router.push({
                name: "txList"
              })
            } else {
              this.$message({message: this.$t('error.' + response.data.code), type: 'error', duration: 3000});
            }
          }).catch((err) => {
            this.$message({message: this.$t('public.err1') + err, type: 'error', duration: 1000});
          });
        } else {
          this.$message({message: this.$t('address.address13'), type: 'error', duration: 1000});
        }
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

