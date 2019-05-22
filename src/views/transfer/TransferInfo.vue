<template>
  <div class="transfer_info bg-gray" v-loading="txInfoLoading">
    <div class="bg-white">
      <div class="w1200">
        <BackBar :backTitle="$t('home.home2')"></BackBar>
        <h3 class="title">{{hash}}
          <i class="iconfont icon-fuzhi clicks" @click="copy(hash)"></i></h3>
      </div>
    </div>

    <div class="card_long mt_20 w1200">
      <h5 class="card-title font18">{{$t('public.basicData')}}</h5>
      <ul>
        <li>{{$t('public.time')}} <label>{{txInfo.createTime}}</label></li>
        <li>{{$t('public.amount')}} <label>{{txInfo.value}}<span class="fCN">NULS</span></label></li>
        <li>{{$t('public.height')}} <label class="click"><u class="td" @click="toUrl('height',txInfo.height)">{{txInfo.height}}</u></label></li>
        <li>{{$t('public.fee')}} <label>{{txInfo.fee}}<span class="fCN">NULS</span></label></li>
        <li>{{$t('public.type')}} <label>{{$t('type.'+txInfo.type)}}</label></li>
        <li>{{$t('public.status')}} <label>{{txInfo.status === 0 ? $t('transferStatus.1'):$t('transferStatus.0')}}</label></li>
        <li v-if="txInfo.type ===1">
          {{$t('public.nodeID')}}
          <label><u class="click td uppercase" @click="toUrl('hash',txInfo.txData.txHash)">{{txInfo.txData.agentId}}</u></label>
        </li>
        <li v-if="txInfo.type ===1">
          {{$t('public.roundInfo')}}
          <label>{{$t('public.rotation')}}
            <u class=" click cd" @click="toUrl('rotation',txInfo.txData.roundIndex)">{{txInfo.txData.roundIndex}}</u>
            {{$t('public.number')}} {{txInfo.txData.packageIndex}}
          </label>
        </li>
        <li v-if="txInfo.type ===3">{{$t('public.alias')}} <label>{{txInfo.txData.alias}}</label></li>
        <li v-if="txInfo.type ===4 || txInfo.type ===5 || txInfo.type ===9">
          {{$t('public.createAddress')}}
          <label><u class="click td" @click="toUrl('address',txInfo.txData.agentAddress)">{{txInfo.txData.agentAddress}}</u></label>
        </li>
        <li v-if="txInfo.type ===4 || txInfo.type ===5 || txInfo.type ===6 || txInfo.type ===9">
          {{$t('public.nodeID')}}
          <label><u class="click td uppercase" @click="toUrl('hash',txInfo.txData.txHash)">{{txInfo.txData.agentId}}</u></label>
        </li>
        <li v-if="txInfo.type ===4 || txInfo.type ===9">
          {{$t('public.packingAddress')}}
          <label><u class="click td" @click="toUrl('address',txInfo.txData.packingAddress)">{{txInfo.txData.packingAddress}}</u></label>
        </li>
        <li v-if="txInfo.type ===4 || txInfo.type ===9"> {{$t('public.commission')}} <label>{{txInfo.txData.commissionRate}}%</label></li>
        <li v-if="txInfo.type ===4 || txInfo.type ===9">
          {{$t('public.rewardAddress')}}
          <label><u class="click td" @click="toUrl('address',txInfo.txData.rewardAddress)">{{txInfo.txData.rewardAddress}}</u></label>
        </li>
        <li v-if="txInfo.type ===9">{{$t('public.deposit')}} <label>{{txInfo.txData.deposit/100000000}}<span class="fCN">NULS</span></label>
        </li>
        <li v-if="txInfo.type ===9">{{$t('public.credit')}} <label>{{txInfo.txData.creditValue}}</label></li>
        <li v-if="txInfo.type !==3">
          {{$t('public.remarks')}}
          <label class="remark overflow tr" :title="txInfo.remark">{{txInfo.remark}}</label>
        </li>
        <li v-if="txInfo.type !==4 && txInfo.type !==6 && txInfo.type !==9"></li>
        <p class="cb"></p>
      </ul>
    </div>
    <div class="cb"></div>

    <div class="card w1200">
      <div class="card-info left fl">
        <h5 class="card-title font18">Input</h5>
        <ul>
          <li v-for="itme of inputData" :key="itme.address">
            <font class="click td" @click="toUrl('address',itme.address)" >{{itme.address}}</font>
            <label>{{itme.amount}}<span class="fCN">NULS</span></label>
          </li>
        </ul>
      </div>
      <div class="card-info right fr">
        <h5 class="card-title font18">Output</h5>
        <ul>
          <li v-for="itme of outputData" :key="itme.address">
            <font class="click td" @click="toUrl('address',itme.address)" >{{itme.address}}</font>
            <label>{{itme.amount}}<span class="fCN">NULS</span></label>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>
  import moment from 'moment'
  import { shell } from 'electron'
  import {timesDecimals, getLocalTime, copys} from '@/api/util'
  import BackBar from '@/components/BackBar'
  import {explorerUrl} from '@/config.js'

  export default {
    data() {
      return {
        txInfoLoading: false,//交易详情动画加载
        hash: this.$route.query.hash,//hash
        txInfo: [],//交易信息
        inputData: [],//输入
        outputData: [],//输出
      };
    },
    created() {

    },
    mounted() {
      this.getTxInfoByHash(this.hash);
    },
    components: {
      BackBar
    },
    methods: {

      /**
       * 根据hash获取交易详情
       * @param hash
       **/
      getTxInfoByHash(hash) {
        this.txInfoLoading = true;
        this.$post('/', 'getTx', [hash])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              response.result.createTime = moment(getLocalTime(response.result.createTime)).format('YYYY-MM-DD HH:mm:ss');
              response.result.fee = timesDecimals(response.result.fee);
              response.result.value = timesDecimals(response.result.value);

              //输入
              if (response.result.coinFroms) {
                for (let itme of response.result.coinFroms) {
                  itme.amount = timesDecimals(itme.amount);
                }
                this.inputData = response.result.coinFroms
              }

              //输出
              if (response.result.coinTos) {
                for (let itme of response.result.coinTos) {
                  itme.amount = timesDecimals(itme.amount);
                }
                this.outputData = response.result.coinTos
              }

              this.txInfo = response.result;
              this.txInfoLoading = false;
            }
          })
          .catch((error) => {
            console.log("getTx:" + error)
          })
      },

      /**
       * 连接跳转
       * @param name
       * @param parameter
       */
      toUrl(name,parameter) {
        let newUrl = '';
        if(name ==='height'){
          newUrl = explorerUrl + 'block/info?height='+parameter
        }else if(name ==='address'){
          newUrl = explorerUrl + 'address/info?address='+parameter
        }else if(name === 'hash'){
          newUrl = explorerUrl + 'consensus/info?hash='+parameter
        }else if(name ==='rotation'){
          newUrl = explorerUrl + 'rotation/info?rotation='+parameter
        }
        console.log(newUrl);
        shell.openExternal(newUrl);
        //window.open(newUrl,'_blank');
      },

      /**
       * 复制方法
       * @param sting
       **/
      copy(sting) {
        copys(sting);
        this.$message({message: this.$t('public.copySuccess'), type: 'success', duration: 1000});
      },

    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .transfer_info {
    .title {
      text-align: left;
    }
    .card {
      margin: 40px auto 0;
      height: 200px;
      .left, .right {
        width: 590px;
        ul {
          li {
            border: 0;
            line-height: 30px;
            height: 30px;
          }
        }
      }
    }

  }

</style>
