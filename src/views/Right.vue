<template>
<el-card class="box-card">
  <my-bread level1="权限管理" level2="权限列表"></my-bread>
  <el-table class="right-table" :data="tableData" border style="width: 50%">
    <el-table-column type="index" label="#" width="100">
    </el-table-column>
    <el-table-column prop="authName" label="权限名称" width="180">
    </el-table-column>
    <el-table-column prop="path" label="路径">
    </el-table-column>
    <el-table-column prop="level" label="层级">
      <template slot-scope="scope">
        <span v-if="scope.row.level === '0'">一级</span>
        <span v-if="scope.row.level === '1'">二级</span>
        <span v-if="scope.row.level === '2'">三级</span>
      </template>
    </el-table-column>
  </el-table>
</el-card>
</template>

<script>
export default {
  data () {
    return {
      tableData: []
    }
  },
  methods: {
    // 获取权限列表-list列表显示
    async loadTableData () {
      const res = await this.$http.get(`rights/list`)
      // console.log(res)
      const {meta: {msg, status}, data} = res.data
      if (status === 200) {
        this.$message.success(msg)
        this.tableData = data
      } else {
        this.$message.error(msg)
      }
    }
  },
  created () {
    this.loadTableData()
  }
}
</script>

<style>
.box-card {
  height: 100%;
}
.right-table {
  margin-top: 20px;
}
</style>
