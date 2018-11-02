<template>
  <el-card class="box-card">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索框 -->
    <el-row class="searchArea">
      <el-col :span="24">
      <el-input placeholder="请输入内容" class="searchInput" v-model="searchVal">
        <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
      </el-input>
      <el-button type="success" @click="showAddUser">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormAddUser">
      <el-form :model="formData">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-model="formData.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="formData.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="formData.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" :label-width="formLabelWidth">
          <el-input v-model="formData.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormAddUser = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑用户的对话框 -->
    <el-dialog title="编辑用户" :visible.sync="dialogFormEditUser">
      <el-form :model="formData">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-model="formData.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="formData.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" :label-width="formLabelWidth">
          <el-input v-model="formData.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormEditUser = false">取 消</el-button>
        <el-button type="primary" @click="editUser(formData)">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="dialogFormChangeRole">
      <el-form :model="currentUser">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          {{currentUser.username}}
        </el-form-item>
        <el-form-item label="角色" :label-width="formLabelWidth">
          <el-select v-model="currentUserRid">
            <el-option label="请选择角色" :value="-1"></el-option>
            <!-- 遍历角色数组 -->
            <el-option v-for="(item, index) in roles" :key="index" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormChangeRole = false">取 消</el-button>
        <el-button type="primary" @click="changeRole(currentUser)">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 表格 -->
    <el-table style="width: 100%" :data="tableData" v-loading="loading">
      <el-table-column type="index" prop="date" label="日期" width="100">
      </el-table-column>
      <el-table-column prop="username" label="姓名" width="100">
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="150">
      </el-table-column>
      <el-table-column prop="mobile" label="电话" width="150">
      </el-table-column>
      <el-table-column label="创建日期" width="200">
        <template slot-scope="scope">
          {{scope.row.create_time | fmtDate}}
        </template>
      </el-table-column>
      <el-table-column label="用户状态" width="100">
        <template slot-scope="scope">
          <el-switch
            @change="changeUserState(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-row>
            <el-button type="primary" icon="el-icon-edit" plain size="mini" circle @click="showEditUser(scope.row)"></el-button>
            <el-button type="success" icon="el-icon-check" plain size="mini" circle @click="showChangeRole(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" plain size="mini" circle @click="deleteUser(scope.row)"></el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      tableData: [],
      // 当前页码
      pagenum: 1,
      // 每页显示条数
      pagesize: 2,
      // loading加载图标
      loading: false,
      total: 0,
      // 添加用户对话框
      dialogFormAddUser: false,
      // 编辑用户对话框
      dialogFormEditUser: false,
      // 分配角色对话框
      dialogFormChangeRole: false,
      // 对话框宽度
      formLabelWidth: '120px',
      // 添加用户对话框表单数据
      formData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      searchVal: '',
      // 用户状态
      userState: '',
      // 当前用户信息
      currentUser: {},
      // 当前用户的角色id
      currentUserRid: -1,
      // 角色列表
      roles: []
    }
  },
  created () {
    this.loadTableData()
  },
  methods: {
    // 获取用户列表
    async loadTableData () {
      this.loading = true
      const AUTH_TOKEN = sessionStorage.getItem('token')
      this.$http.defaults.headers.common['Authorization'] = AUTH_TOKEN
      const res = await this.$http.get(`users?pagenum=${this.pagenum}&pagesize=${this.pagesize}&query=${this.searchVal}`)
      // console.log(res)
      const {data, meta} = res.data
      if (meta.status === 200) {
        // this.$message.success(meta.msg)
        this.tableData = data.users
        this.loading = false
        this.total = data.total
        // console.log(res)
      } else {
        this.message.error(meta.msg)
      }
    },
    // 改变每页显示条数
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.loadTableData()
    },
    // 跳转页
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.loadTableData()
    },
    // 显示添加用户对话框
    showAddUser () {
      this.dialogFormAddUser = true
    },
    async addUser () {
      const res = await this.$http.post('users', this.formData)
      // console.log(res)
      const {meta} = res.data
      if (meta.status === 201) {
        this.$message.success(meta.msg)
        this.loadTableData()
      } else {
        this.$message.error(meta.msg)
      }
      this.formData = {}
      this.dialogFormAddUser = false
    },
    searchUser () {
      this.pagenum = 1
      this.loadTableData()
      console.log(this.pagenum)
    },
    // 更改用户状态
    async changeUserState (user) {
      const res = await this.$http.put(`users/${user.id}/state/${user.mg_state}`)
      // console.log(res)
      const {meta: {status, msg}} = res.data
      if (status === 200) {
        this.$message.success(msg)
      }
    },
    // 删除用户
    deleteUser (user) {
      this.$confirm('确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`users/${user.id}`)
        // console.log(res)
        const {meta: {msg, status}} = res.data
        if (status === 200) {
          this.$message({
            type: 'success',
            message: msg
          })
          this.pagenum = 1
          this.loadTableData()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 显示编辑用户对话框
    showEditUser (user) {
      this.dialogFormEditUser = true
      this.formData = user
    },
    // 编辑用户
    async editUser (user) {
      const res = await this.$http.put(`users/${user.id}`, this.formData)
      const {meta: {msg, status}} = res.data
      if (status === 200) {
        this.$message.success(msg)
        this.loadTableData()
        this.dialogFormEditUser = false
      } else {
        this.$message.error(msg)
      }
    },
    // 显示分配角色对话框
    async showChangeRole (userId) {
      this.dialogFormChangeRole = true
      const res = await this.$http.get(`users/${userId}`)
      // console.log(res)
      this.currentUser = res.data.data
      this.currentUserRid = res.data.data.rid
      // console.log(this.currentUser)
      this.getRoles()
    },
    // 获取角色列表
    async getRoles () {
      const res = await this.$http.get('roles')
      // console.log(res)
      this.roles = res.data.data
      // console.log(this.roles)
    },
    // 分配角色
    async changeRole (user) {
      const res = await this.$http.put(`users/${user.id}/role`, {
        rid: this.currentUserRid
      })
      // console.log(res)
      const {meta: {msg, status}} = res.data
      if (status === 200) {
        this.$message.success(msg)
        this.dialogFormChangeRole = false
      } else {
        this.$message.error(msg)
        this.dialogFormChangeRole = false
      }
    }
  }
}
</script>

<style>
.box-card {
  height: 100%;
}
.searchArea {
  margin-top: 10px;
  margin-bottom: 10px;
}
.searchArea .searchInput {
  width: 350px;
}
</style>
