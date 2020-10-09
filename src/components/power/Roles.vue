<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="roleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRights(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRights(scope.row, item2.id)">{{item2.authName}} </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRights(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="roleDialog(false, scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
            <el-button type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      :title="isAdd === 0 ? '添加角色' : '修改角色'"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClose">
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data () {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: '',
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名称长度在3-10之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      isAdd: 0
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.roleList = res.data
    },
    async removeRights (role, rightId) {
      const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        role.children = res.data
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 获取角色的3级权限id,并保存到defKeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDialogClose () {
      this.defKeys = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 提交 / 修改角色
    addRole () {
      // isAdd 为 0 则添加角色
      if (this.isAdd === 0) {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.post('/roles', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加角色失败')
          }
          this.$message.success('添加角色成功')
          this.addDialogVisible = false
          this.getRolesList()
        })
      } else {
        // 修改角色
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          const { data: res } = await this.$http.put(`/roles/${this.isAdd}`, this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('修改角色失败')
          }
          this.$message.success('修改角色成功')
          this.addDialogVisible = false
          this.getRolesList()
        })
      }
    },
    // 打开添加角色对话框
    async roleDialog (type = true, id = 0) {
      if (type) {
        this.addDialogVisible = true
      } else {
        this.isAdd = id
        // 获取要修改角色的信息, 显示到表单中
        const { data: res } = await this.$http.get(`/roles/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色信息失败')
        }
        this.addDialogVisible = true
        this.addForm.roleName = res.data.roleName
        this.addForm.roleDesc = res.data.roleDesc
      }
    },
    // 关闭添加角色对话框
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.isAdd = 0
    },
    // 删除角色
    async removeRole (id) {
      const confirmResult = await this.$confirm('此操作将删除该角色, 是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`/roles/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败')
        }
        this.$message.success('删除角色成功')
        this.getRolesList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
