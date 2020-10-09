<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改订单</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form
        :model="orderForm"
        :rules="rules"
        ref="formRef">
        <p>订单编号: {{orderInfo.order_number}}</p>
        <p>订单类型: {{orderInfo.order_fapiao_title}}</p>
        <p>订单创建时间: {{orderInfo.create_time | dateFormat}}</p>
        <el-form-item label="订单价格(元)" prop="order_price">
          <el-input v-model="orderForm.order_price" type="number" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="是否付款" prop="pay_status">
          <el-radio-group v-model="orderForm.pay_status">
            <el-radio label="0" border>未付款</el-radio>
            <el-radio label="1" border>已付款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否发货" prop="is_send">
          <el-radio-group v-model="orderForm.is_send">
            <el-radio label="否" border>未发货</el-radio>
            <el-radio label="是" border>已发货</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="orderForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="orderForm.address2" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">修改订单</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import cityData from '../../assets/citydata'

export default {
  name: 'editOrder',
  data () {
    return {
      cityData: cityData,
      orderForm: {
        is_send: 0,
        pay_status: 0,
        order_price: 0,
        address1: '',
        address2: ''
      },
      rules: {
        order_price: [
          { required: true, message: '请输入订单价格', trigger: 'blur' }
        ],
        is_send: [
          { required: true, message: '请选择发货状况', trigger: 'change' }
        ],
        pay_status: [
          { required: true, message: '请选择支付状况', trigger: 'change' }
        ]
      },
      orderInfo: {
        order_number: '',
        order_fapiao_title: '',
        create_time: ''
      }
    }
  },
  async created () {
    // 获取订单详细信息
    const { data: res } = await this.$http.get(`orders/${this.$route.params.id}`)
    if (res.meta.status !== 200) {
      return this.$message.error('获取订单信息失败')
    }
    this.orderInfo.order_number = res.data.order_number
    this.orderInfo.order_fapiao_title = res.data.order_fapiao_title
    this.orderInfo.create_time = res.data.create_time
    this.orderForm.is_send = res.data.is_send
    this.orderForm.pay_status = res.data.pay_status
    this.orderForm.order_price = res.data.order_price
  },
  methods: {
    submitForm () {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`/orders/${this.$route.params.id}`, {
          is_send: this.orderForm.is_send,
          pay_status: this.orderForm.pay_status,
          order_price: this.orderForm.order_price
        })
        if (res.meta.status !== 201) {
          return this.$message.error('修改订单失败')
        }
        this.$message.success('修改订单成功')
        this.$router.replace('/orders')
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
