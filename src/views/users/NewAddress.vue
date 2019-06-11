<template>
  <div class="new_address bg-gray">
    <div class="bg-white">
      <div class="w1200">
        <BackBar :backTitle="$t('address.address0')" v-show="ifAddressInfo"></BackBar>
        <h3 class="title"><font v-if="!isBackups">{{$t('newAddress.newAddress0')}}</font><font v-else>{{$t('newAddress.newAddress1')}}</font>
        </h3>
      </div>
    </div>
    <div class="new w1200 mt_20 bg-white">
      <ul class="step" v-show="false">
        <li>
          <p class="dotted Ndotted"></p>
        </li>
        <li>
          <p class="ico"><i class="el-icon-view Ncolor"></i></p>
          <h6 class="Ncolor">{{$t('newAddress.newAddress2')}}</h6>
        </li>
        <li>
          <p class="dotted" :class="!isFirst ? 'Ndotted':''"></p>
        </li>
        <li>
          <p class="ico"><i class="el-icon-location-outline" :class="!isFirst ? 'Ncolor':''"></i></p>
          <h6 :class="!isFirst ? 'Ncolor':''">{{$t('newAddress.newAddress3')}}</h6>
        </li>
        <li>
          <p class="dotted"></p>
        </li>
      </ul>
      <div class="cb"></div>

      <div class="w630" v-show="isFirst">
        <div class="tip bg-gray">
          <p><i></i>{{$t('newAddress.newAddress4')}}</p>
          <p><i></i>{{$t('newAddress.newAddress5')}}</p>
        </div>
        <div class="cb"></div>
        <el-form :model="passwordForm" status-icon :rules="passwordRules" ref="passwordForm" class="mb_20">
          <el-form-item :label="$t('newAddress.newAddress6')" prop="pass">
            <el-input type="password" v-model="passwordForm.pass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item :label="$t('newAddress.newAddress7')" prop="checkPass">
            <el-input type="password" v-model="passwordForm.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          <div class="font12">{{$t('newAddress.newAddress8')}}<span
                  class="click" @click="userDialog=true">{{$t('newAddress.newAddress9')}}</span></div>
          <el-form-item class="form-next">
            <el-button type="success" @click="submitPasswordForm('passwordForm')">{{$t('newAddress.newAddress10')}}
            </el-button>
            <el-button type="text" @click="toUrl('importAddress')">{{$t('newAddress.newAddress11')}}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="step_tow w630" v-show="!isFirst">
        <h3 class="title">
          {{$t('newAddress.newAddress12')}}：
          <span>{{newAddressInfo.address}}</span>
          <i class="iconfont iconfuzhi clicks" @click="copy(newAddressInfo.address)"></i>
        </h3>
        <div class="tip bg-gray">
          <p>{{$t('newAddress.newAddress13')}}</p>
          <p>{{$t('newAddress.newAddress14')}}</p>
          <p>{{$t('newAddress.newAddress15')}}</p>
        </div>

        <div class="btn mb_20">
          <el-button type="success" @click="backKeystore">{{$t('newAddress.newAddress16')}}</el-button>
          <el-button type="text" @click="backKey">{{$t('newAddress.newAddress17')}}</el-button>
          <el-button type="info" @click="goWallet" v-show="!isBackups">{{$t('newAddress.newAddress18')}}</el-button>
        </div>
      </div>

    </div>
    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
    <el-dialog :title="$t('newAddress.newAddress19')" width="40%"
               :visible.sync="keyDialog"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
      <span>{{$t('newAddress.newAddress20')}}</span>
      <p class="bg-white">
        {{newAddressInfo.pri}}
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="copy(newAddressInfo.pri)">{{$t('newAddress.newAddress21')}}</el-button>
      </span>
    </el-dialog>

    <el-dialog title="用户协议" width="40%" :visible.sync="userDialog" class="userDiolog">
      <div class="bg-white userInfo">
        <p>在前些日子举办的Google IO 2019 年度开发者大会上，Flutter web作为一个很亮眼的技术受到了开发者的追捧。这是继Flutter支持Android</p>
        <p>IOS等设备之后，又一个里程碑式的版本，后续还会支持windows、linux、Macos、chroms等其他嵌入式设备。Flutter本身是一个类似于RN、WEEX、hHybrid等多端</p>
        <p>统一跨平台解决方案，真正做到了一次编写，多处运行，它的发展超出了很多人的想象，值得前端开发者去关注，今天我们来体验一下Flutter Web</p>
        <p>在前些日子举办的Google IO 2019 年度开发者大会上，Flutter web作为一个很亮眼的技术受到了开发者的追捧。这是继Flutter支持Android</p>
        <p>IOS等设备之后，又一个里程碑式的版本，后续还会支持windows、linux、Macos、chroms等其他嵌入式设备。Flutter本身是一个类似于RN、WEEX、hHybrid等多端</p>
        <p>统一跨平台解决方案，真正做到了一次编写，多处运行，它的发展超出了很多人的想象，值得前端开发者去关注，今天我们来体验一下Flutter Web</p>
        <p>在前些日子举办的Google IO 2019 年度开发者大会上，Flutter web作为一个很亮眼的技术受到了开发者的追捧。这是继Flutter支持Android</p>
        <p>IOS等设备之后，又一个里程碑式的版本，后续还会支持windows、linux、Macos、chroms等其他嵌入式设备。Flutter本身是一个类似于RN、WEEX、hHybrid等多端</p>
        <p>统一跨平台解决方案，真正做到了一次编写，多处运行，它的发展超出了很多人的想象，值得前端开发者去关注，今天我们来体验一下Flutter Web</p>
        <p>在前些日子举办的Google IO 2019 年度开发者大会上，Flutter web作为一个很亮眼的技术受到了开发者的追捧。这是继Flutter支持Android</p>
        <p>IOS等设备之后，又一个里程碑式的版本，后续还会支持windows、linux、Macos、chroms等其他嵌入式设备。Flutter本身是一个类似于RN、WEEX、hHybrid等多端</p>
        <p>统一跨平台解决方案，真正做到了一次编写，多处运行，它的发展超出了很多人的想象，值得前端开发者去关注，今天我们来体验一下Flutter Web</p>
      </div>

    </el-dialog>
  </div>
</template>

<script>
  import nuls from 'nuls-sdk-js'
  import Password from '@/components/PasswordBar'
  import BackBar from '@/components/BackBar'
  import {copys, chainID, chainIdNumber, addressInfo} from '@/api/util'

  export default {
    data() {
      let validatePass = (rule, value, callback) => {
        let patrn = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
        if (value === '') {
          callback(new Error(this.$t('newAddress.newAddress22')));
        } else if (!patrn.exec(value)) {
          callback(new Error(this.$t('newAddress.newAddress23')));
        } else {
          if (this.passwordForm.checkPass !== '') {
            this.$refs.passwordForm.validateField('checkPass');
          }
          callback();
        }
      };
      let validatePassTwo = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('newAddress.newAddress24')));
        } else if (value !== this.passwordForm.pass) {
          callback(new Error(this.$t('newAddress.newAddress25')));
        } else {
          callback();
        }
      };
      return {
        isFirst: true,//第一步
        isBackups: false,//备份账户
        keyDialog: false, //key弹框
        userDialog: false,//用户协议弹框
        ifAddressInfo: sessionStorage.hasOwnProperty(sessionStorage.key(0)),//判断是否账户地址
        passwordForm: {
          pass: 'nuls123456',
          checkPass: 'nuls123456',
        },
        passwordRules: {
          pass: [
            {validator: validatePass, trigger: 'blur'}
          ],
          checkPass: [
            {validator: validatePassTwo, trigger: 'blur'}
          ]
        },
        newAddressInfo: {}, //新建的地址信息
        backType: 0,//备份类型 0：keystore备份 1：明文私钥备份
      };
    },
    created() {
      if (this.$route.query.address) {
        this.isFirst = false;
        this.isBackups = true;
        this.newAddressInfo.address = this.$route.query.address;
        this.newAddressInfo.aesPri = this.$route.query.aesPri;
      }
    },
    mounted() {
    },
    components: {
      Password,
      BackBar
    },
    methods: {

      /**
       * 创建地址
       * @param formName
       */
      submitPasswordForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.newAddressInfo = nuls.newAddress(chainID(), this.passwordForm.pass);
            let newAddressInfo = {
              address: this.newAddressInfo.address,
              aesPri: this.newAddressInfo.aesPri,
              pub: this.newAddressInfo.pub,
              selection: false,
              alias: "",
              remark: "",
              balance: 0,
              consensusLock: 0,
              totalReward: 0,
              tokens: []
            };
            let addressList = [];
            let newAddressList = [];
            newAddressList.push(newAddressInfo);
            let newArr = addressInfo(0);
            if (newArr.length !== 0) {
              addressList = [...newAddressList, ...newArr];
            } else {
              newAddressInfo.selection = true;
              addressList[0] = newAddressInfo
            }
            localStorage.setItem(chainIdNumber(), JSON.stringify(addressList));
            this.isFirst = false;
          } else {
            return false;
          }
        });
      },

      /**
       * 备份keystore
       **/
      backKeystore() {
        this.backType = 0;
        this.$refs.password.showPassword(true);
      },

      /**
       * 备份私钥
       **/
      backKey() {
        this.backType = 1;
        this.$refs.password.showPassword(true)
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      passSubmit(password) {
        let that = this;
        const pri = nuls.decrypteOfAES(this.newAddressInfo.aesPri, password);
        const newAddressInfo = nuls.importByKey(chainID(), pri, password);
        if (newAddressInfo.address === this.newAddressInfo.address) {
          if (this.backType === 0) {
            const {dialog} = require('electron').remote;
            //console.log(dialog);
            dialog.showOpenDialog({
              title: that.$t('newAddress.newAddress28'),
              properties: ['openFile', 'openDirectory']
            }, function (files) {
              //console.log(files);
              if (files) {
                let fileName = files + '/' + newAddressInfo.address + '.keystore';
                let fileInfo = {
                  address: newAddressInfo.address,
                  encryptedPrivateKey: newAddressInfo.aesPri,
                  pubKey: newAddressInfo.pubKey,
                  priKey: null
                };
                //console.log(JSON.stringify(fileInfo));
                let fs = require("fs");
                fs.writeFile(fileName, JSON.stringify(fileInfo), 'utf8', function (error) {
                  if (error) {
                    that.$message({message: that.$t('newAddress.newAddress26') + error, type: 'error', duration: 1000});
                    return false;
                  }
                  that.$message({message: that.$t('newAddress.newAddress27') + files, type: 'success', duration: 3000});
                })
              }
            });
          } else {
            this.newAddressInfo.pri = pri;
            this.keyDialog = true;
          }
        } else {
          this.$message({message: this.$t('address.address13'), type: 'error', duration: 1000});
        }
      },

      /**
       * 进入钱包
       */
      goWallet() {
        this.toUrl('home');
        //this.getAccount(newAddressInfo);
      },

      /**
       * 获取账户网络信息
       * @param newAddressInfo
       */
      async getAccount(newAddressInfo) {
        await this.$post('/', 'getAccount', [newAddressInfo.address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              console.log(response.result);
            } else {
              console.log(response.result);
            }
          })
          .catch((error) => {
            console.log("getAccount:" + error);
          });
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

      /**
       * 复制方法
       * @param sting
       **/
      copy(sting) {
        copys(sting);
        this.$message({message: this.$t('public.copySuccess'), type: 'success', duration: 1000});
        this.keyDialog = false;
      },
    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .new_address {
    .new {
      border: @BD1;
      .step {
        height: 50px;
        margin: 100px 140px 0 140px;
        li {
          float: left;
          width: 20%;
          height: 50px;
          text-align: center;
          .dotted {
            margin: 20px 0 0 0;
            border-bottom: 2px dotted @Dcolour;
          }
          .Ndotted {
            border-bottom-color: @Ncolour;
          }
          .Ncolor {
            color: @Ncolour;
          }
          .ico {
            i {
              font-size: 30px;
            }
          }
        }
      }
      .tip {
        margin: 40px auto;
        padding: 20px 30px;
        p {
          i {
            width: 5px;
            height: 5px;
            display: block;
            float: left;
            margin: 9px 10px 0 0;
            border-radius: 5px;
            background: #000000;
          }
        }
      }
      .step_tow {
        .title {
          height: 30px;
          line-height: 30px;
          margin: 40px auto 0;
        }
        .tip {
          margin: 40px auto;
        }
        .btn {
          .el-button--info {
            margin: 50px 0 20px 0 !important;
          }
        }
      }
    }
  }

</style>
