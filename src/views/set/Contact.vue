<template>
  <div class="contact bg-gray">
    <h3 class="title">联系人</h3>
    <div class="w1200 mt_20">
      <div class="top_ico">
        <i class="el-icon-plus click" @click="addOrEditRemark"></i>
      </div>
      <el-table :data="contactList" stripe border>
        <el-table-column prop="balance" label="名称" align="center">
        </el-table-column>
        <el-table-column prop="address" label="地址" align="center" min-width="200">
        </el-table-column>
        <el-table-column prop="alias" :label="$t('address.address3')" align="center">
        </el-table-column>
        <el-table-column :label="$t('address.address5')" align="center" width="350">
          <template slot-scope="scope">
            <label class="click tab_bn" @click="editPassword(scope.row)">编辑</label>
            <span class="tab_line">|</span>
            <label class="click tab_bn" @click="backAddress(scope.row)">删除</label>
          </template>
        </el-table-column>
      </el-table>
      <div class="pages">
        <div class="page-total">{{$t('public.total')}} {{contactList.length}}</div>
      </div>
    </div>

    <el-dialog title="Remarks" width="30rem"
               :visible.sync="contactDialog"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
    >

      <div class="address-remark bg-white">
        <el-input v-model.trim="remarkInfo" :placeholder="$t('address.address9')"></el-input>
        <div class="btn-next">
          <el-button @click="remarkDialog=false">{{$t('address.address10')}}</el-button>
          <el-button type="success" @click='addRemark'>{{$t('address.address11')}}</el-button>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {chainID, addressInfo} from '@/api/util'

  export default {
    data() {
      return {
        contactList: [],//地址列表
        selectAddressInfo: '', //操作的地址信息
        contactDialog: false,//备注弹框
        remarkInfo: '',//备注信息
      };
    },
    created() {
      this.getContactList();
    },
    mounted() {

    },
    methods: {

      /**
       * 获取联系人列表
       */
      getContactList() {
        let contactID = 'contact' + chainID;
        this.contactList = localStorage.hasOwnProperty(contactID) ? localStorage.getItem(contactID) : [];
      },


      /**
       *  移除账户
       * @param rowInfo
       **/
      deleteAddress(rowInfo) {
        this.selectAddressInfo = rowInfo;
        this.$refs.password.showPassword(true)
      },

      /**
       *  编辑账户备注弹框
       * @param rowInfo
       */
      addOrEditRemark(rowInfo) {
        this.contactDialog = true;
        if (rowInfo) {

        }
      },

      /**
       * 连接跳转
       * @param name
       * @param param
       */
      toUrl(name, param) {
        //console.log(name)
        this.$router.push({
          name: name,
          query: {'address': param}
        })
      },
    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .contact {
    .el-dialog__body {
      background-color: @Bcolour;
      padding: 30px 20px 50px 20px;
      .address-remark {
        margin: 50px auto 0;
        .btn-next {
          margin: 40px auto 0;
          text-align: center;
          .el-button {
            width: 9.5rem;
          }
          .el-button--success {
            span {
              color: white;
            }
          }
        }
      }
    }
  }


</style>
