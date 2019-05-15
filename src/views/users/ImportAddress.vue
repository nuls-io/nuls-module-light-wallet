<template>
  <div class="import_address bg-gray">
    <div class="bg-white">
      <div class="w1200">
        <BackBar :backTitle="$t('importAddress.importAddress0')"></BackBar>
        <h3 class="title">{{$t('importAddress.importAddress1')}}</h3>
      </div>
    </div>
    <div class="w1200 mt_20 bg-white">
      <div class="radio">
        <el-radio v-model="importRadio" label="importKeystore" disabled>{{$t('importAddress.importAddress2')}}</el-radio>
        <el-radio v-model="importRadio" label="importKey">{{$t('importAddress.importAddress3')}}</el-radio>
      </div>

      <div class="btn mb_100" v-show="importRadio==='importKeystore'">
        <el-button type="success">{{$t('importAddress.importAddress4')}}</el-button>
      </div>

      <div class="w630" v-show="importRadio==='importKey'">
        <el-form :model="importKeyForm" status-icon :rules="importKeyRules" ref="importKeyForm" class="mb_100">
          <el-form-item :label="$t('importAddress.importAddress5')" prop="key">
            <el-input type="textarea" v-model.trim="importKeyForm.key"></el-input>
          </el-form-item>
          <el-form-item :label="$t('importAddress.importAddress6')" prop="pass">
            <el-input type="password" v-model="importKeyForm.pass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item :label="$t('importAddress.importAddress7')" prop="checkPass">
            <el-input type="password" v-model="importKeyForm.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item class="form-next">
            <el-button type="success" @click="submitForm('importKeyForm')">{{$t('importAddress.importAddress8')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  import nuls from 'nuls-sdk-js'
  import BackBar from '@/components/BackBar'

  export default {
    data() {
      let checkKey = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('importAddress.importAddress9')));
        } else {
          callback();
        }
      };
      let validatePass = (rule, value, callback) => {
        let patrn = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
        if (value === '') {
          callback(new Error(this.$t('importAddress.importAddress10')));
        } else if (!patrn.exec(value)) {
          callback(new Error(this.$t('importAddress.importAddress11')));
        } else {
          if (this.importKeyForm.checkPass !== '') {
            this.$refs.importKeyForm.validateField('checkPass');
          }
          callback();
        }
      };
      let validateCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('importAddress.importAddress12')));
        } else if (value !== this.importKeyForm.pass) {
          callback(new Error(this.$t('importAddress.importAddress13')));
        } else {
          callback();
        }
      };
      return {
        importRadio: 'importKey',
        importKeyForm: {
          key: '',
          pass: '',
          checkPass: ''
        },
        importKeyRules: {
          pass: [
            {validator: validatePass, trigger: ['blur', 'change']}
          ],
          checkPass: [
            {validator: validateCheckPass, trigger: ['blur', 'change']}
          ],
          key: [
            {validator: checkKey, trigger: ['blur', 'change']}
          ]
        }
      };
    },
    components: {
      BackBar
    },
    methods: {

      /**
       * 私钥导入钱包
       * @param formName
       */
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.importWallet()
          } else {
            return false;
          }
        });
      },

      /**
       * 导入
       */
      importWallet() {
        const importAddressInfo = nuls.importByKey(2,this.importKeyForm.key,this.importKeyForm.pass);
        let addressInfo = {
          address: importAddressInfo.address,
          aesPri: importAddressInfo.aesPri,
          pub: importAddressInfo.pub,
          alias: '',
          remark: '',
          selection:false,
        };
        localStorage.setItem(importAddressInfo.address, JSON.stringify(addressInfo));
        this.toUrl('address')
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

  .import_address {
    .mt_20 {
      border: @BD1;
      .radio {
        width: 300px;
        text-align: center;
        margin: 50px auto;
      }
    }
  }
</style>
