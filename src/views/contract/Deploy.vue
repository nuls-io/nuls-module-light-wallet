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
        <el-form-item label="" prop="hex" v-if="resource ==='0'" class="hex">
          <el-input type="textarea" :rows="10" v-model="deployForm.hex" @change="getParameter"></el-input>
        </el-form-item>

        <div class="upload_jar" v-else="resource==='1'">
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
            <el-input v-model="domain.value"></el-input>
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
        <el-form-item label="Addtion" prop="addtion">
          <el-input v-model="deployForm.addtion"></el-input>
        </el-form-item>
      </div>


      <el-form-item class="form-next">
        <el-button type="success" @click="submitForm('ruleForm')">测试合约</el-button>
        <br/>
        <div class="mb_20"></div>
        <el-button @click="resetForm('ruleForm')">部署合约</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

  import {getNulsBalance, countFee, getContractConstructor, validateAndBroadcast} from '@/api/requestData'
  export default {
    name: "deploy",
    data() {
      return {
        //选择部署
        resource: '0',
        deployForm: {
          hex: '',
          parameterList: [],
          senior: false
        },
        deployRules: {}
      };
    },
    created() {

    },
    mounted() {
      //this.getTxInfoByHash(this.hash);
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
      async getParameter(){
        if(this.deployForm.hex.length > 500){
         let parameter = await getContractConstructor(this.deployForm.hex);
         console.log(parameter);
         if(parameter.success){
            this.deployForm.parameterList = parameter.data.args
         }else {
           this.$message({message: '获取构造函数错误:'+parameter.data.error, type: 'error', duration: 1000});
         }
        }
      }
    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .deploy {
    margin: 20px auto 100px;
    .modes{
      margin: 10px auto 0;
      .hex {
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
      .parameter{
        width: 500px;
        margin: 0 auto 0;
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
          //float: right;
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
