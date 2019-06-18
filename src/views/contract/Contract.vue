<template>
  <div class="contract">
    <h3 class="title">
      {{addressInfo.address}}
      <span v-show="addressInfo.alias">({{addressInfo.alias}})</span>
      <i class="iconfont icon-fuzhi clicks"></i>
    </h3>
    <el-tabs v-model="contractActive" @tab-click="handleClick" class="w1200">
      <el-tab-pane :label="$t('contract.contract1')" name="contractFirst">
        <div class="my_contract">
          <el-table :data="myContractData" stripe border>
            <el-table-column :label="$t('contract.contract2')" align="center" min-width="220">
              <template slot-scope="scope">
                <span v-if="scope.row.status === 3">{{scope.row.contractAddress}}</span>
                <span class="click" @click="toUrl('contractInfo',scope.row.contractAddress,0,'first')"
                      v-if="scope.row.status !== 3">{{scope.row.contractAddress}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" :label="$t('public.time')" align="center">
            </el-table-column>
            <el-table-column :label="$t('contract.contract3')" align="center">
              <template slot-scope="scope">
                <span class="click" @click="toUrl()">{{scope.row.tag}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('public.status')" align="center">
              <template slot-scope="scope"><span>{{ $t('contractStatus.'+scope.row.status) }}</span></template>
            </el-table-column>
            <el-table-column :label="$t('public.operation')" align="center">
              <template slot-scope="scope">
                <label class="tab_bn" v-if="scope.row.status ===3">--</label>
                <label class="click tab_bn" v-else @click="toUrl('contractInfo',scope.row.contractAddress,0,'fourth')">{{$t('contract.contract4')}}</label>
              </template>
            </el-table-column>
          </el-table>
          <div class="pages">
            <div class="page-total">
              {{$t('public.display')}} {{pageIndex-1 === 0 ? 1 : (pageIndex-1) *pageSize}}-{{pageIndex*pageSize}}
              {{$t('public.total')}} {{pageTotal}}
            </div>
            <el-pagination v-show="pageTotal > pageSize" @current-change="myContractPages" class="fr"
                           :current-page="pageIndex"
                           :page-size="pageSize"
                           background
                           layout=" prev, pager, next, jumper"
                           :total="pageTotal">
            </el-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('contract.contract5')" name="contractSecond">
        <div class="bg-white w1200 search">
          <div class="search-div">
            <el-input :placeholder="$t('contract.contract6')" v-model="searchContract" class="search-input">
            </el-input>
            <el-button type="success" class="search-button" @click="searchContractByAddress">
              {{$t('contract.contract7')}}
            </el-button>
            <u class="click td"
               @click="toUrl('http://alpha.nulscan.io/contracts','',1)">{{$t('contract.contract8')}}</u>
          </div>
          <div class="contract-info bg-gray" v-show="contractInfo.contractAddress">
            <div class="contract-address font18">
              <span>{{$t('contract.contract9')}}:{{contractInfo.contractAddress}}</span> <i
                    class="el-icon-star-off"></i>
            </div>
            <Call :modelList="modelData" :contractAddress="contractInfo.contractAddress"></Call>
          </div>
        </div>

      </el-tab-pane>
      <el-tab-pane :label="$t('contract.contract10')" name="contractThird">
        <Deploy :addressInfo="addressInfo"></Deploy>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import moment from 'moment'
  import {getLocalTime, addressInfo} from '@/api/util'
  import Deploy from './Deploy'
  import Call from './Call'

  export default {
    data() {
      return {
        addressInfo: {},//地址信息
        contractActive: 'contractFirst',
        //我的合约
        myContractData: [],
        pageIndex: 1, //页码
        pageSize: 10, //每页条数
        pageTotal: 0,//总页数
        currentPage4: 4,
        searchContract: '',//搜索合约
        contractInfo: {},//合约详情
        modelData: [],//合约方法列表
      };
    },
    created() {
      this.addressInfo = addressInfo(1);
      setInterval(() => {
        this.addressInfo = addressInfo(1);
      }, 500);

    },
    mounted() {
      this.getMyContractByAddress(this.addressInfo.address);
    },
    components: {
      Deploy,
      Call
    },
    watch: {
      addressInfo(val, old) {
        if (val.address !== old.address && old.address) {
          console.log(val)
        }
      }
    },
    methods: {

      /**
       * tab 切换
       **/
      handleClick(tab, event) {
        console.log(tab, event);
      },

      /**
       * 获取所有合约列表
       **/
      async getMyContractByAddress() {
        await this.$post('/', 'getContractList', [this.pageIndex, this.pageSize, false, false])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let item of response.result.list) {
                item.createTime = moment(getLocalTime(item.createTime * 1000)).format('YYYY-MM-DD HH:mm:ss');
              }
              this.myContractData = response.result.list;
              this.pageTotal = response.result.totalCount;
            } else {
              this.$message({message: this.$t('contract.contract11') + response.error, type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            this.$message({message: this.$t('contract.contract12') + error, type: 'error', duration: 1000});
          });
      },

      /**
       * 合约列表分页
       **/
      myContractPages(val) {
        this.pageIndex = val;
        this.getMyContractByAddress()
      },

      /**
       * 搜索合约
       **/
      async searchContractByAddress() {
        if (this.searchContract.length > 30) {
          await this.$post('/', 'getContract', [this.searchContract])
            .then((response) => {
              //console.log(response);
              if (response.hasOwnProperty("result")) {
                this.contractInfo = response.result;
                this.modelData = response.result.methods;
              } else {
                this.$message({
                  message: this.$t('contract.contract13') + response.error,
                  type: 'error',
                  duration: 1000
                });
              }
            })
            .catch((error) => {
              this.$message({message: this.$t('contract.contract14') + error, type: 'error', duration: 1000});
            });
        } else {
          this.$message({message: this.$t('contract.contract15'), type: 'error', duration: 1000});
        }
      },

      /**
       * 连接跳转
       * @param name
       * @param parms
       * @param type
       * @param activeName
       */
      toUrl(name, parms, type = 0, activeName) {
        //console.log(name) contractInfo
        if (type.toString() === '0') {
          if (name === 'contractInfo') {
            this.$router.push({
              name: name,
              query: {contractAddress: parms, activeName: activeName}
            });
          } else {
            this.$router.push({
              name: name
            });
          }

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

  .contract {
    background-color: @Bcolour1;
    .el-tabs {
      margin: 30px auto 0;
      .search {
        min-height: 500px;
        border: @BD1;
        margin: 20px 0 0 0;
        .search-div {
          text-align: center;
          margin: 20px 0 0 0;
          .search-input {
            width: 400px;
          }
          .search-button {
            width: 120px;
            margin: 0 20px;
            padding: 9px;
          }
        }
        .contract-info {
          width: 625px;
          padding: 0;
          margin: 20px auto 30px;
          .contract-address {
            line-height: 40px;
            text-align: center;
            i {
              float: right;
              margin: 10px 20px 0 0;
            }
          }
        }
      }

    }
  }
</style>
