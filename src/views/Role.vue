<template>
<el-card class="box-card">
  <my-bread level1="权限列表" level2="角色列表"></my-bread>
  <el-button class="addBtn" type="warning">添加角色</el-button>
  <!-- 表格 -->
  <el-table :data="roleList" style="width: 100%">
    <!-- 展开项 -->
    <el-table-column type="expand" class="">
      <template slot-scope="scope">
        <el-row v-for="(item1, index) in scope.row.children" :key="index">
          <el-col :span="4">
            <el-tag @close="deleteRight(scope.row, item1.id)" closable type="success">{{item1.authName}}</el-tag>
          </el-col>
          <el-col :span="20">
            <el-row v-for="(item2, index) in item1.children" :key="index">
              <el-col :span="4">
                <el-tag @close="deleteRight(scope.row, item2.id)" closable type="warning">{{item2.authName}}</el-tag>
              </el-col>
              <el-col :span="20">
                <el-tag @close="deleteRight(scope.row, item3.id)" closable v-for="(item3, index) in item2.children" :key="index" class="right-level3">{{item3.authName}}</el-tag>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <span v-if="scope.row.children.length === 0">此角色暂无权限</span>
      </template>
    </el-table-column>
    <!-- 表头 -->
    <el-table-column type="index" label="#" prop="id">
    </el-table-column>
    <el-table-column label="角色名称" prop="roleName">
    </el-table-column>
    <el-table-column label="描述" prop="roleDesc">
    </el-table-column>
    <!-- 操作按钮 -->
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-row>
          <el-tooltip class="item" effect="dark" content="编辑角色" placement="left">
            <el-button type="primary" icon="el-icon-edit" plain size="mini" circle @click="showEditRole(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="分配权限" placement="top">
            <el-button type="success" icon="el-icon-check" plain size="mini" circle @click="showSetRight(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="删除角色" placement="right">
            <el-button type="danger" icon="el-icon-delete" plain size="mini" circle @click="deleteRole(scope.row)"></el-button>
          </el-tooltip>
        </el-row>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分配权限对话框 -->
  <el-dialog @close="closeDia" title="分配权限" :visible.sync="dialogSetRight" width="30%">
    <template slot-scope="scope">
      <el-tree  ref="tree" :data="rightList" show-checkbox node-key="id" :default-expanded-keys="expandedArr" :default-checked-keys="checkedArr" :props="defaultProps">
      </el-tree>
    </template>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="setRight">确 定</el-button>
    </span>
  </el-dialog>
</el-card>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      roleList: [],
      // 显示分配权限对话框
      dialogSetRight: false,
      // 权限列表
      rightList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展开的数组
      expandedArr: [],
      // 默认选中的数组
      checkedArr: [],
      // 角色id
      roleId: -1
    }
  },
  methods: {
    // 获取角色列表
    async getRoles () {
      const res = await this.$http.get('roles')
      // console.log(res)
      const {meta: {msg, status}, data} = res.data
      if (status === 200) {
        this.roleList = data
        // console.log(this.roleList)
        this.$message.success(msg)
      } else {
        this.$message.error(msg)
      }
    },
    // 删除角色权限
    async deleteRight (role, rightId) {
      // roles/:roleId/rights/:rightId
      const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      // console.log(res)
      const {meta: {msg, status}, data} = res.data
      if (status === 200) {
        this.$message.success(msg)
        role.children = data
      } else {
        this.$message.error(msg)
      }
    },
    // 显示分配权限对话框
    showSetRight (role) {
      console.log(role)
      this.dialogSetRight = true
      this.loadTableData()
      // console.log(role)
      this.getCurrentRightId(role.children)
      // console.log(this.roleList)
      // console.log(this.checkedArr)
      this.roleId = role.id
      // console.log(role.children)
    },
    // 获取权限列表-tree树状显示
    async loadTableData () {
      const res = await this.$http.get(`rights/tree`)
      // console.log(res)
      const {meta: {msg, status}, data} = res.data
      if (status === 200) {
        // this.$message.success(msg)
        this.rightList = data
        // console.log(data)
        this.getRightId(data)
        // console.log(this.expandedArr)
      } else {
        this.$message.error(msg)
      }
    },
    closeDia () {
      this.expandedArr = []
      this.checkedArr = []
      // console.log(this.checkedArr)
    },
    // 递归读取出多维数组中的所有权限id
    getRightId (rightArr) {
      rightArr.forEach(item => {
        this.expandedArr.push(item.id)
        if (item.children) {
          this.getRightId(item.children)
        }
      })
    },
    // 递归读取出当前角色的所有叶子级权限id
    getCurrentRightId (rightArr) {
      rightArr.forEach(item => {
        if (item.children) {
          this.getCurrentRightId(item.children)
        } else {
          this.checkedArr.push(item.id)
        }
      })
    },
    // 分配权限
    async setRight () {
      // roles/:roleId/rights
      this.dialogSetRight = false
      const arr1 = this.$refs.tree.getCheckedKeys()
      const arr2 = this.$refs.tree.getHalfCheckedKeys()
      const arr = [...arr1, ...arr2]
      const res = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: arr.join(',')
      })
      console.log(res)
      const {meta: {msg, status}} = res.data
      if (status === 200) {
        this.$message.success(msg)
        this.getRoles()
      } else {
        this.$message.error(msg)
      }
    }
  },
  created () {
    this.getRoles()
  }
}
</script>

<style>
.box-card {
  height: 100%;
}
.addBtn {
  margin-top: 10px;
}
.right-level3 {
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
