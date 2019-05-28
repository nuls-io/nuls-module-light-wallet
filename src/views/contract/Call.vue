<template>
  <div class="call">
    <el-form :model="callForm" :rules="callRules" ref="callForm" class="call-form">
      <el-form-item label="请选择一个方法" prop="region" class="search-model">
        <el-select v-model="callForm.modelValue" placeholder="请选择一个方法" @change="changeModel">
          <el-option v-for="item in callForm.modelData" :key="item.name" :label="item.name"
                     :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-for="(domain, index) in callForm.parameterList" :label="domain.name" :key="domain.name"
                    :prop="'parameterList.' + index + '.value'"
                    :rules="{required: domain.required,message:domain.name+'不能为空', trigger: 'blur'}"
      >
        <el-input v-model="domain.value"></el-input>
      </el-form-item>
      <el-form-item class="search-submit">
        <el-button type="success" @click="submitForm('ruleForm')">调 用</el-button>
      </el-form-item>
    </el-form>
    <div class="cb"></div>
    <div class="w1200 bg-gray result">
      调用结果
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        addressInfo: {},//地址信息
        //调用接口form
        callForm: {
          modelData: [],
          modelValue: '',
          parameterList: [],
        },
        callRules: {}
      };
    },
    props: {
      modelList: Array
    },
    created() {
      this.callForm.modelData = this.modelList;
      /* this.addressInfo = JSON.parse(sessionStorage.getItem(sessionStorage.key(0)));
       setInterval(() => {
         this.addressInfo = JSON.parse(sessionStorage.getItem(sessionStorage.key(0)));
       }, 500);*/
    },
    mounted() {

    },

    watch: {
      modelList(val) {
        this.callForm.modelData = val;
      },
      addressInfo(val, old) {
        if (val.address !== old.address && old.address) {

        }
      }
    },
    methods: {

      /**
       *  方法选择
       **/
      changeModel(val) {
        for (let itme of this.callForm.modelData) {
          if (itme.name === val) {
            this.callForm.parameterList = itme.params;
          }
        }
      },
    }
  };
</script>

<style lang="less">
  .call {
    .el-form-item {
      margin: 0 0 20px 70px;
      width: 500px;
    }
    .search-model {
      margin: 0 0 30px 70px;
      .el-form-item__label {
        width: 500px;
        text-align: left;
        float: none;
        padding: 0;
        line-height: 17px;
      }
      .el-form-item__content {
        .el-select {
          width: 500px;
          .el-input__inner {
            width: 500px;
          }
        }
      }
    }
    .search-submit {
      text-align: center;
      margin: 15px 0 15px 70px;
      .el-button {
        width: 150px;
        padding: 9px;
      }
    }
    .result {
      width: 625px;
      margin: 0 auto;
      border-top: 20px solid #ffffff;
      padding: 15px 0 15px 20px;
    }
  }

</style>
