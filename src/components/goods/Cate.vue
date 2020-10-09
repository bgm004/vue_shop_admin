<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类表格 -->
      <tree-table
        class="tree_table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border>
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted  === false"></i>
          <i class="el-icon=error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页器 -->
       <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queyInfo.pagenum"
          :page-sizes="[4, 6, 8, 10]"
          :page-size="queyInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClose">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'categories',
  data () {
    return {
      queyInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 4
      },
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      cateList: [],
      total: 0,
      addCateDialogVisible: false,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '级别',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      editCateDialogVisible: false,
      cat_id: 0
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories', { params: this.queyInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 分页器大小变化
    handleSizeChange (newSize) {
      this.queyInfo.pagesize = newSize
      this.getCateList()
    },
    // 分页器页码变化
    handleCurrentChange (newPage) {
      this.queyInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog () {
      this.getParrntCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类
    async getParrntCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    parentCateChange () {
      // selectedKeys的length大于0 则表示选中了父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('/categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 删除商品分类
    async removeCate (id) {
      const confirmResult = await this.$confirm('此操作将删除分类, 是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        }
        this.$message.success('删除分类成功')
        this.getCateList()
      }
    },
    // 修改商品分类
    async editCate (id) {
      this.editCateDialogVisible = true
      const { data: res } = await this.$http.get(`/categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.addCateForm.cat_name = res.data.cat_name
      this.cat_id = res.data.cat_id
    },
    editCateDialogClose () {
      this.$refs.editCateFormRef.resetFields()
    },
    editCateDialog () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`/categories/${this.cat_id}`, this.addCateForm)
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败')
        }
        this.$message.success('更新分类成功')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.tree_table{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
