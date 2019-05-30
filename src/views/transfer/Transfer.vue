<template>
  <div class="transfer bg-gray">
    <h3 class="title">{{changeAssets.account}} {{$t('nav.transfer')}}</h3>
    <div class="w1200 bg-white">
      <el-form :model="transferForm" :rules="transferRules" ref="transferForm">
        <el-form-item :label="$t('transfer.transfer0')">
          <el-input v-model.trim="transferForm.fromAddress" disabled>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('transfer.transfer1')" prop="toAddress">
          <el-input v-model.trim="transferForm.toAddress" @change="changeParameter">
            <i class="iconfont iconlianxiren click" slot="suffix" @click="showBook" v-show="false"></i>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('transfer.transfer2')">
          <el-select v-model="transferForm.type" @change="changeType">
            <el-option
                    v-for="item in addressInfo.tokens"
                    :key="item.account"
                    :label="item.account"
                    :value="item.account">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('transfer.transfer3')" prop="amount">
          <span class="balance font12 fr">{{$t('public.usableBalance')}}: {{changeAssets.balance}}</span>
          <el-input v-model="transferForm.amount" @change="changeParameter">
          </el-input>
        </el-form-item>

        <div class="div-senior" v-show="transferForm.type !== 'NULS'">
          <el-form-item label="高级选项" class="senior">
            <el-switch v-model="transferForm.senior"></el-switch>
          </el-form-item>
          <div class="senior-div" v-if="transferForm.senior">
            <el-form-item label="Gas Limit" prop="gas">
              <el-input v-model="transferForm.gas"></el-input>
            </el-form-item>
            <el-form-item label="Price" prop="price">
              <el-input v-model="transferForm.price"></el-input>
            </el-form-item>
          </div>
        </div>


        <el-form-item :label="$t('transfer.transfer4')">
          <el-input type="textarea" v-model="transferForm.remarks" maxlength="100" show-word-limit>
          </el-input>
        </el-form-item>
        <div class="font14">
          <el-tooltip placement="top">
            <div slot="content">{{$t('transfer.transfer5')}}</div>
            <i class="el-icon-warning"></i>
          </el-tooltip>
          {{$t('public.fee')}}: {{fee}} <span class="fCN">NULS</span>
        </div>
        <el-form-item class="form-next">
          <el-button type="success" @click="submitForm('transferForm')">{{$t('public.next')}}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
    <el-dialog :title="$t('transfer.transfer6')" :visible.sync="transferVisible" width="40rem" class="confirm-dialog">
      <div class="bg-white">
        <div class="div-data">
          <p>{{$t('transfer.transfer0')}}&nbsp;</p>
          <label>{{transferForm.fromAddress}}</label>
        </div>
        <div class="div-data">
          <p>{{$t('transfer.transfer1')}}&nbsp;</p>
          <label>{{transferForm.toAddress}}</label>
        </div>
        <div class="div-data">
          <p>{{$t('public.fee')}}: &nbsp;</p>
          <label>{{fee}} <span class="fCN">NULS</span></label>
        </div>
        <div class="div-data">
          <p>{{$t('tab.tab6')}}:&nbsp;</p>
          <label class="yellow">{{transferForm.amount}} <span class="fCN">{{changeAssets.account}}</span></label>
        </div>
        <div class="div-data">
          <p>{{$t('transfer.transfer4')}}&nbsp;</p>
          <label>{{transferForm.remarks}}</label>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="transferVisible = false">{{$t('transfer.transfer7')}}</el-button>
        <el-button type="success" @click="confirmTraanser">{{$t('transfer.transfer8')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

  import nuls from 'nuls-sdk-js'
  import sdk from 'nuls-sdk-js/lib/api/sdk'
  import utils from 'nuls-sdk-js/lib/utils/utils'
  import {getNulsBalance, countFee, inputsOrOutputs, validateAndBroadcast} from '@/api/requestData'
  import * as config from '@/config.js'
  import {RightShiftEight, Times, Power, Plus} from '@/api/util'
  import Password from '@/components/PasswordBar'

  export default {

    data() {
      let validateToAddress = (rule, value, callback) => {
        let patrn = /^(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{20,50}$/;
        if (value === '') {
          callback(new Error(this.$t('transfer.transfer9')))
        } else if (!patrn.exec(value)) {
          callback(new Error(this.$t('transfer.transfer10')))
        } else {
          callback()
        }
      };
      let validateAmount = (rule, value, callback) => {
        let patrn = /^([1-9][\d]{0,72}|0)(\.[\d]{1,72})?$/;
        if (value === '') {
          callback(new Error(this.$t('transfer.transfer11')))
        } else if (!patrn.exec(value)) {
          callback(new Error(this.$t('transfer.transfer12')))
        } else if (parseFloat(value) < 0.001) {
          callback(new Error(this.$t('transfer.transfer13')))
        } else {
          setTimeout(() => {
            if (parseInt(RightShiftEight(value).toString()) > parseInt(RightShiftEight(this.changeAssets.balance).toString())) {
              callback(new Error(this.$t('transfer.transfer14')))
            } else {
              callback()
            }
          }, 200);
        }
      };
      let validateGas = (rule, value, callback) => {
        if (!value) {
          callback(new Error("请输入Gas Limit"));
        } else if (value < 1 || value > 10000000) {
          callback(new Error("Gag Limit范围;1~10000000"));
        } else {
          callback();
        }
      };
      let validatePrice = (rule, value, callback) => {
        if (!value) {
          callback(new Error("请输入Price"));
        } else if (value < 1) {
          callback(new Error("Price必须大于1"));
        } else {
          callback();
        }
      };

      return {
        addressInfo: '', //默认账户信息
        balanceInfo: '',//账户余额信息
        changeAssets: '',//选择的资产信息
        //转账数据
        transferForm: {
          fromAddress: '',
          toAddress: '',
          type: this.$route.query.accountType ? this.$route.query.accountType : 'NULS',
          amount: '',
          senior: false,
          gas: 0,
          price: sdk.CONTRACT_MINIMUM_PRICE,
          remarks: '',
        },
        //验证信息
        transferRules: {
          toAddress: [
            {validator: validateToAddress, trigger: ['blur', 'change']}
          ],
          amount: [
            {validator: validateAmount, trigger: ['blur', 'change']}
          ],
          gas: [
            {validator: validateGas, trigger: ['blur', 'change']}
          ],
          price: [
            {validator: validatePrice, trigger: 'blur'}
          ],
        },
        //手续费
        fee: 0.001,
        //转账确认弹框
        transferVisible: false,
      };
    },
    created() {
      this.addressInfo = JSON.parse(sessionStorage.getItem(sessionStorage.key(0)));
      setInterval(() => {
        this.addressInfo = JSON.parse(sessionStorage.getItem(sessionStorage.key(0)));
      }, 500);
      this.transferForm.fromAddress = this.addressInfo.address
    },
    mounted() {
      this.assetsBalance();
    },
    watch: {
      addressInfo(val, old) {
        if (val.address !== old.address && old.address) {
          this.transferForm.fromAddress = this.addressInfo.address
        }
      }
    },
    components: {
      Password,
    },
    methods: {

      /**
       * 验证参数
       **/
      changeParameter() {
        if (this.transferForm.type !== 'NULS') {
          this.transferForm.gas = sdk.CONTRACT_MAX_GASLIMIT;
          this.$refs['transferForm'].validate((valid) => {
            if (valid) {
              let gasLimit = sdk.CONTRACT_MAX_GASLIMIT;
              let price = this.transferForm.price;
              let contractAddress = this.changeAssets.contractAddress;
              let methodName = 'transfer';
              let methodDesc = '';
              let args = [this.transferForm.toAddress, Number(Times(this.transferForm.amount, Number(Power(this.changeAssets.decimals))))];
              this.validateContractCall(this.addressInfo.address, 0, gasLimit, price, contractAddress, methodName, methodDesc, args);
            } else {
              return false;
            }
          });
        } else {
          this.$refs['transferForm'].validate();
        }

      },

      /**
       * 资产类型选择
       * @param type
       **/
      changeType(type) {
        this.changeParameter();
        if (type === 'NULS') {
          this.transferForm.gas = 5;
          this.transferForm.price = 5;
        } else {
          this.transferForm.gas = 0;
          this.transferForm.price = sdk.CONTRACT_MINIMUM_PRICE;
        }
        this.transferForm.type = type;
        this.assetsBalance();
      },

      /**
       * 资产类型余额
       **/
      assetsBalance() {
        for (let item of this.addressInfo.tokens) {
          if (item.account === this.transferForm.type) {
            this.changeAssets = item;
          }
        }
      },

      /**
       * 转账功能下一步
       * @param formName
       */
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.transferVisible = true
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },

      /**
       * 弹框确认提交
       **/
      async confirmTraanser() {
        await getNulsBalance(this.transferForm.fromAddress).then((response) => {
          if (response.success) {
            this.balanceInfo = response.data;
            this.$refs.password.showPassword(true)
          } else {
            this.$message({message: this.$t('public.err') + response, type: 'error', duration: 1000});
          }
        }).catch((error) => {
          this.$message({message: this.$t('public.err0') + error, type: 'error', duration: 1000});
        });
      },

      /**
       * 获取转出账户余额信息
       *  @param assetsId
       *  @param address
       **/
      async getNulsBalance(assetsId = 1, address) {
        await this.$post('/', 'getAccountBalance', [assetsId, address])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result")) {
              this.balanceInfo = {'balance': response.result.balance, 'nonce': response.result.nonce};
              this.$refs.password.showPassword(true);
            } else {
              this.$message({message: this.$t('public.err') + response, type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            this.$message({message: this.$t('public.err0') + error, type: 'error', duration: 1000});
          });
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        const pri = nuls.decrypteOfAES(this.addressInfo.aesPri, password);
        const newAddressInfo = nuls.importByKey(2, pri, password);
        if (newAddressInfo.address === this.addressInfo.address) {
          let transferInfo = {fromAddress: this.transferForm.fromAddress, assetsChainId: 2, assetsId: 1, fee: 10000};
          let inOrOutputs = {};
          let tAssemble = [];
          if (this.changeAssets.account === 'NULS') {
            transferInfo['toAddress'] = this.transferForm.toAddress;
            transferInfo['amount'] = Number(Times(this.transferForm.amount, 100000000).toString());
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 2);
            //交易组装
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, this.transferForm.remarks, 2);
          } else {
            transferInfo['amount'] = Number(Plus(0, Number(Times(this.transferForm.gas, this.transferForm.price))));
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, this.transferForm.remarks, 16, this.contractCallData);
          }
          //交易签名
          let txhex = "";
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            if (this.changeAssets.account === 'NULS') {
              inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 2);
              tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, this.transferForm.remarks, 2);
            } else {
              inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
              tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, this.transferForm.remarks, 16, this.contractCallData);
            }
            txhex = await nuls.transactionSerialize(nuls.decrypteOfAES(this.addressInfo.aesPri, password), this.addressInfo.pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(nuls.decrypteOfAES(this.addressInfo.aesPri, password), this.addressInfo.pub, tAssemble);
          }
          //console.log(txhex);
          //验证并广播交易
          await validateAndBroadcast(txhex).then((response) => {
            if (response.success) {
              this.toUrl("txList");
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
       * 验证调用合约交易
       * @param sender
       * @param value
       * @param gasLimit
       * @param price
       * @param contractAddress
       * @param methodName
       * @param methodDesc
       * @param args
       */
      async validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
        return await this.$post('/', 'validateContractCall', [sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              //return {success: true, data: response.result};
              this.imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args)
            } else {
              console.log("验证调用合约交易错误");
            }
          })
          .catch((error) => {
            console.log("验证调用合约交易异常" + error);
          });
      },

      /**
       * 预估调用合约交易的gas
       * @param sender
       * @param value
       * @param contractAddress
       * @param methodName
       * @param methodDesc
       * @param args
       */
      async imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
        return await this.$post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args])
          .then((response) => {
            if (response.hasOwnProperty("result")) {
              this.transferForm.gas = response.result.gasLimit;
              let contractConstructorArgsTypes = this.getContractMethodArgsTypes(contractAddress, methodName);
              let newArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
              this.contractCallData = {
                chainId: config.API_CHAIN_ID,
                sender: sender,
                contractAddress: contractAddress,
                value: value,
                gasLimit: this.transferForm.gas,
                price: this.transferForm.price,
                methodName: methodName,
                methodDesc: methodDesc,
                args: newArgs
              };
              console.log(this.contractCallData)
            } else {
              console.log("预估调用合约交易的gas错误");
            }
          })
          .catch((error) => {
            console.log("预估调用合约交易的gas异常" + error);
          });
      },

      /**
       * 获取合约指定函数的参数类型
       * @param contractAddress, methodName
       * @returns {Promise<AxiosResponse<any>>}
       */
      async getContractMethodArgsTypes(contractAddress, methodName) {
        return await this.$post('/', 'getContractMethodArgsTypes', [contractAddress, methodName])
          .then((response) => {
            if (response.hasOwnProperty("result")) {
              return {success: true, data: response.result};
            } else {
              return {success: false, data: response.error};
            }
          })
          .catch((error) => {
            return {success: false, data: error};
          });
      },

      /**
       * 通讯录功能
       * TODO 待开发...
       **/
      showBook() {
        this.$message({message: "开发者......", duration: 1000});
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
  @import "./../../assets/css/style";

  .transfer {
    .w1200 {
      border: @BD1;
      margin: -20px auto 0;
      border-radius: 2px;
      .el-form {
        width: 600px;
        margin: 50px auto 100px;
        .el-form-item {
          .el-form-item__content {
            .el-select {
              width: 100%;
              .el-input__inner {
                width: 100%;
              }
            }
            .balance {
              margin: 10px 0 0 0;
            }
            .el-textarea {
              .el-input__count {
                background: transparent;
                bottom: -10px;
              }
            }
          }
        }
        .div-senior {
          margin: -15px 0;
          .senior {
            margin: 0 0 0 0;
            .el-form-item__label {
              line-height: 40px;
              position: absolute;
              right: 420px;
            }
            .el-form-item__content {
              text-align: right;
              .el-switch {
                .el-switch__core {
                }
              }
            }
          }
          .senior-div {
            margin: 0 0 25px 0;
            .el-form-item {
              margin: 0 0 5px 0;
              .el-form-item__label {
                line-height: 24px;
              }
            }
          }
        }
      }
    }
  }

</style>
