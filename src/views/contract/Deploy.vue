<template>
  <div class="deploy">
    <div class="select_resource">
      <el-radio-group v-model="resource" @change="changeRadio">
        <el-radio label="0">HEX码</el-radio>
        <el-radio label="1">Jar包</el-radio>
      </el-radio-group>
    </div>

    <el-form :model="deployForm" :rules="deployRules" ref="deployForm">
      <div class="modes bg-white w1200">
        <el-form-item label="" prop="hex" v-show="resource ==='0'" class="hex">
          <el-input type="textarea" :rows="10" v-model.trim="deployForm.hex" @change="getParameter"></el-input>
        </el-form-item>

        <div class="upload_jar" v-show="resource==='1'">
          <div class="click upload tc">
            <i class="el-icon-upload2 font30"></i>
            <p class="font18">上传jar包</p>
          </div>
        </div>

        <div class="parameter" v-if="deployForm.parameterList">
          <el-form-item v-for="(domain, index) in deployForm.parameterList" :label="domain.name" :key="domain.name"
                        :prop="'parameterList.' + index + '.value'"
                        :rules="{required: domain.required,message:domain.name+'不能为空', trigger: 'blur'}"
          >
            <el-input v-model.trim="domain.value" @change="changeParameter"></el-input>
          </el-form-item>
        </div>
      </div>

      <el-form-item label="高级选项" class="senior">
        <el-switch v-model="deployForm.senior"></el-switch>
      </el-form-item>

      <div v-if="deployForm.senior" class="senior-div">
        <el-form-item label="Gas Limit" prop="gas">
          <el-input v-model="deployForm.gas"></el-input>
        </el-form-item>
        <el-form-item label="Price" prop="price">
          <el-input v-model="deployForm.price"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="addtion">
          <el-input v-model="deployForm.addtion"></el-input>
        </el-form-item>
      </div>
      <el-form-item class="form-next">
        <el-button type="success" @click="testSubmitForm('deployForm')">
          测试合约
        </el-button>
        <br/>
        <div class="mb_20"></div>
        <el-button @click="submitForm('deployForm')">部署合约</el-button>
      </el-form-item>
    </el-form>
    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
  </div>
</template>

<script>
  import nuls from 'nuls-sdk-js'
  import sdk from 'nuls-sdk-js/lib/api/sdk'
  import utils from 'nuls-sdk-js/lib/utils/utils'
  import {
    getNulsBalance,
    countFee,
    inputsOrOutputs,
    getContractConstructor,
    validateTx,
    broadcastTx,
  } from '@/api/requestData'
  import * as config from '@/config.js'
  import Password from '@/components/PasswordBar'
  import {getArgs} from '@/api/util'

  export default {
    name: "deploy",
    data() {
      return {
        //选择部署
        resource: '0',
        //不是表单
        deployForm: {
          hex: '',
          parameterList: [],
          senior: false,
          gas: '',
          price: '',
          addtion: '',
        },
        deployRules: {
          hex: [
            {required: true, message: '请输入hex编码', trigger: 'blur'},
          ],
          gas: [
            {type: 'number', required: true, message: '请输入gas', trigger: 'blur'},
          ],
          price: [
            {type: 'number', required: true, message: '请输入price', trigger: 'blur'},
          ]
        },
        createAddress: '',//创建合约地址
        contractCreateTxData: {},//组装创建合约交易
        balanceInfo: {},//账户余额信息
        isTestSubmit: false,//测试合约

      };
    },
    props: {
      addressInfo: Object
    },
    components: {
      Password,
    },
    created() {
      this.createAddress = this.addressInfo.address;
      this.getBalanceByAddress(this.createAddress);
    },
    mounted() {
      //this.getTxInfoByHash(this.hash);
    },
    watch: {
      addressInfo(val, old) {
        if (val.address !== old.address && old.address) {
          this.createAddress = val.address;
          this.getBalanceByAddress(this.createAddress);
        }
      }
    },
    methods: {

      /**
       * 选择部署智能合约方式
       * @param e
       */
      changeRadio(e) {
        this.resource = e;
      },

      /**
       * hex码 有值获取参数
       */
      async getParameter() {
        if (this.deployForm.hex.length > 500) {
          let parameter = await getContractConstructor(this.deployForm.hex);
          if (parameter.success) {
            this.deployForm.parameterList = parameter.data.args
          } else {
            this.$message({message: '获取构造函数错误:' + parameter.data.error, type: 'error', duration: 1000});
          }
        }
      },

      /**
       * 判断所有必填参数是否有值
       **/
      changeParameter() {
        let newArgs = getArgs(this.deployForm.parameterList);
        if (newArgs.allParameter) {
          this.validateContractCreate(this.createAddress, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, this.deployForm.hex, newArgs.args);
          this.deployForm.price = sdk.CONTRACT_MINIMUM_PRICE;
        }
      },

      /**
       * 验证创建合约交易
       * @param createAddress
       * @param gasLimit
       * @param price
       * @param contractCode
       * @param args
       */
      async validateContractCreate(createAddress, gasLimit, price, contractCode, args) {
        return await this.$post('/', 'validateContractCreate', [createAddress, gasLimit, price, contractCode, args])
          .then((response) => {
            //console.log(response.result);
            if (response.result.success) {
              this.imputedContractCreateGas(createAddress, contractCode, args);
            } else {
              console.log("验证创建合约交易错误")
            }
          })
          .catch((error) => {
            console.log("验证创建合约交易异常" + error)
          });
      },

      /**
       * 预估创建合约交易的gas
       * @param createAddress
       * @param contractCode
       * @param args
       */
      async imputedContractCreateGas(createAddress, contractCode, args) {
        return await this.$post('/', 'imputedContractCreateGas', [createAddress, contractCode, args])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              this.deployForm.gas = response.result.gasLimit;
              this.makeCreateData(response.result.gasLimit, createAddress, contractCode, args);
            } else {
              console.log("预估创建合约交易的gas错误");
            }
          })
          .catch((error) => {
            console.log("预估创建合约交易的gas异常" + error);
          });
      },

      /**
       * 组装构造函数的参数类型
       * @param constructor
       */
      async makeContractConstructorArgsTypes(constructor) {
        let args = constructor;
        let length = args.length;
        let contractConstructorArgsTypes = new Array(length);
        let arg;
        for (let i = 0; i < length; i++) {
          arg = args[i];
          contractConstructorArgsTypes[i] = arg.type;
        }
        return contractConstructorArgsTypes;
      },

      /**
       * 组装创建合约交易的txData
       * @param createAddress
       * @param gasLimit
       * @param contractCode
       * @param args
       */
      async makeCreateData(gasLimit, createAddress, contractCode, args) {
        let contractCreate = {};
        contractCreate.chainId = config.API_CHAIN_ID;
        contractCreate.sender = createAddress;
        contractCreate.gasLimit = gasLimit;
        contractCreate.price = sdk.CONTRACT_MINIMUM_PRICE;
        contractCreate.contractCode = contractCode;

        let constructor = this.deployForm.parameterList;
        let contractConstructorArgsTypes = this.makeContractConstructorArgsTypes(constructor);
        contractCreate.args = await utils.twoDimensionalArray(args, contractConstructorArgsTypes);
        contractCreate.contractAddress = sdk.getStringContractAddress(config.API_CHAIN_ID);
        console.log(contractCreate);
        if (!contractCreate.args || !contractCreate.chainId || !contractCreate.contractAddress || !contractCreate.contractCode || !contractCreate.gasLimit || !contractCreate.price || !contractCreate.sender) {
          console.log("组装创建合约交易的txData错误")
        } else {
          this.contractCreateTxData = contractCreate;
          //console.log(this.contractCreateTxData);
        }
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
       * 测试部署合约
       * @param formName
       **/
      testSubmitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isTestSubmit = true;
            this.$refs.password.showPassword(true)
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },

      /**
       * 部署合约
       * @param formName
       **/
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.isTestSubmit = false;
            this.$refs.password.showPassword(true)
          } else {
            return false;
          }
        });
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        const pri = nuls.decrypteOfAES(this.addressInfo.aesPri, password);
        const newAddressInfo = nuls.importByKey(2, pri, password);
        let amount = this.contractCreateTxData.gasLimit * this.contractCreateTxData.price;
        if (newAddressInfo.address === this.addressInfo.address) {
          let transferInfo = {
            fromAddress: this.addressInfo.address,
            assetsChainId: config.API_CHAIN_ID,
            assetsId: 1,
            amount: amount,
            fee: 100000
          };
          let pub = this.addressInfo.pub;
          let remark = this.deployForm.addtion;
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
          let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          //console.log(txhex);

          await validateTx(txhex).then((response) => {
            console.log(response);
            if (response.success) {
              if (this.isTestSubmit) {
                this.$message({message: '测试通过', type: 'success', duration: 1000});
              } else {
                broadcastTx(txhex).then((response) => {
                  if (response.success) {
                    this.$router.push({
                      name: "txList"
                    })
                  } else {
                    this.$message({message: this.$t('public.err') + response.data, type: 'error', duration: 1000});
                  }
                }).catch((err) => {
                  this.$message({message: this.$t('public.err0') + err, type: 'error', duration: 1000});
                });
              }
            } else {
              this.$message({message: this.$t('public.err') + response.data, type: 'error', duration: 1000});
            }
          }).catch((err) => {
            this.$message({message: this.$t('public.err0') + err, type: 'error', duration: 1000});
          });
        }else {
          this.$message({message: this.$t('address.address13'), type: 'error', duration: 1000});
        }
      }

    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .deploy {
    margin: 20px auto 100px;
    .modes {
      margin: 10px auto 0;
      .hex {
        margin: 0 0 -10px 0;
      }
      .upload_jar {
        padding: 20px 0;
        .upload {
          width: 200px;
          height: 200px;
          margin: 0 auto 0;
          padding: 50px 0 0 0;
          border: @BD1;
          i {

          }
          p {
            line-height: 30px;
          }
        }
      }
      .parameter {
        width: 500px;
        margin: 20px auto 0;
        padding: 0 0 10px 0;
      }
    }

    .senior {
      margin: 0 0 0 0;
      .el-form-item__label {
        line-height: 40px;
        position: absolute;
        right: 40px;
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
      .el-form-item {
        margin: 0 0 5px 0;
        .el-form-item__label {
          line-height: 24px;
        }
      }
    }
  }
</style>
