<template>
  <div>
    <el-table
      v-if="list"
      :data="dataList"
      height="300"
      style="width: 100%"
      :tooltip-options="tooltipOptions"
      :row-class-name="tableRowClassName"
    >
      <el-table-column :label="$t('table.stockName')" width="90px" align="left">
        <template slot-scope="{row}">
          <span @click="handleNameClick(row)">{{ row.name }}</span>
          <!-- <el-tag v-if="row.is_again_limit" size="small">回封</el-tag> -->
        </template>
      </el-table-column>
      <el-table-column prop="latest" :label="$t('table.latest')" sortable width="88px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.latest }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="currency_value" :label="$t('table.currency_value')" sortable width="100px" align="left">
        <template slot-scope="{row}">
          <span>{{ (row.currency_value/Math.pow(10,8)).toFixed(0) }}亿</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('table.limit_up_type')" width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.limit_up_type }}</span>
        </template>
      </el-table-column> -->
      <el-table-column :label="$t('table.high_days')" width="100px" align="left">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="high_days_search"
            size="mini"
            placeholder="几天几板"
          />
        </template>
        <template slot-scope="{row}">
          <span>{{ row.high_days }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.time_preview')" width="150px" align="left">
        <template slot-scope="{row}">
          <preview-chart :data="row.time_preview" />
        </template>
      </el-table-column>
      <el-table-column prop="order_amount" :label="$t('table.order_amount')" sortable width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.order_amount>Math.pow(10,8)?(row.order_amount/Math.pow(10,8)).toFixed(1)+'亿':(row.order_amount/10000).toFixed(0)+'万' }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('table.is_again_limit')" width="100px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.is_again_limit }}</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="first_limit_up_time" :label="$t('table.first_limit_up_time')" sortable width="100px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.first_limit_up_time | parseTime('{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.last_limit_up_time')" width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.last_limit_up_time | parseTime('{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排名" width="50px" align="center">
        <template slot-scope="{row}">
          <el-popover placement="top-start" width="500" trigger="click" @show="handlePopShow(row.code)" @hide="handlePopHide">
            <div :ref="row.code" v-loading="popLoading" style="width: 480px;height: 300px" />
            <el-button slot="reference" type="text" icon="el-icon-s-data" />
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.reason_type')" align="left">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="reason_type_search"
            size="mini"
            placeholder="涨停原因"
          />
        </template>
        <template slot-scope="{row}">
          <span>{{ row.reason_type }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogCdstVisible" width="60%">
      <template slot="title">
        <span>{{ stockName }}</span>
        <span class="candlestick-title">{{ zyyw }}</span>
      </template>
      <candlestick-chart v-loading="candlestickLoading" :chartData="chartData" />
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import CandlestickChart from './CandlestickChart'
import PreviewChart from './PreviewChart'

import { fetchLimitUpList, fetchStockHistoryRank, fetchStockZy, fetchStockCandlestick } from '@/api/stock'
import { parseTime } from '@/utils'

export default {
  components: {
    CandlestickChart,
    PreviewChart
  },
  props: {
    limit_up_date: {
      type: Date
    }
  },
  data() {
    return {
      list: null,
      chart: null,
      timer: null,
      high_days_search: '',
      reason_type_search: '',
      chartData: [],
      stockName: '',
      zyyw: '',
      popLoading: false,
      candlestickLoading: false,
      dialogCdstVisible: false,
      tooltipOptions: {
        effect: 'dark',
        placement: 'top-end'
        // enterable: true,
        // offset: {
        //   x: 100,
        //   y: 10
        // }
      }
    }
  },
  computed: {
    dataList() {
      return this.list.filter(d => 
        (!this.high_days_search || d.high_days.toLowerCase().includes(this.high_days_search.toLowerCase())) &&
        (!this.reason_type_search || d.reason_type && d.reason_type.toLowerCase().includes(this.reason_type_search.toLowerCase()))
      )
    }
  },
  watch: {
    limit_up_date: {
      handler(val) {
        fetchLimitUpList({ date: parseTime(val, '{y}-{m}-{d}') }).then(response => {
          this.list = response.data
          const data = this.processLimitUpData(this.list)
          this.$emit('handleSetLimitUpData', data)
        })
      }
    }
  },
  created() {
    this.fetchData()
    this.timer = setInterval(() => {
      this.fetchData()
    }, 1000*60*5)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    fetchData() {
      fetchLimitUpList({ date: parseTime(this.limit_up_date, '{y}-{m}-{d}') }).then(response => {
        this.list = response.data
        const data = this.processLimitUpData(this.list)
        this.$emit('handleSetLimitUpData', data)
      })
    },
    processLimitUpData(arr) {
      const concept_data = arr.map(item => item.reason_type).join('+').split('+')
      const total_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0) {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const first_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0 && obj.high_days === '首板') {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const two_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0 && obj.high_days === '2天2板') {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const three_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0 && obj.high_days === '3天3板') {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      return {
        conceptData: concept_data,
        totalCount: total_count,
        firstCount: first_count,
        twoCount: two_count,
        threeCount: three_count
      }
    },
    handleNameClick(row) {
      this.stockName = row.name
      this.candlestickLoading = true
      fetchStockZy({code: row.code}).then(res => {
        this.zyyw = res.data
        this.dialogCdstVisible = true
      })
      fetchStockCandlestick({ code: row.code }).then(res => {
        this.chartData = res.data
        // this.$set(this, 'chartData', res.data)
        this.candlestickLoading = false
      })
    },
    handlePopShow(code) {
      this.$nextTick(() => {
        this.chart = echarts.init(this.$refs[code])
      })
      this.popLoading = true
      fetchStockHistoryRank({ code: code }).then(res => {
        this.chart.setOption({
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            left: '2px',
            top: '5%',
            right: '2px',
            bottom: '2px',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: res.data['date']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              type: 'line',
              step: 'start',
              data: res.data['rank']
            }
          ]
        })
        this.popLoading = false
      })
    },
    handlePopHide() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    tableRowClassName({row}) {
      if (row.is_open === 1) {
        return 'warning-row'
      }
      return ''
    }
  }
}
</script>
<style>
  .tooltip-container {
    width: 300px;
  }
  .el-table .warning-row {
    background: #67C23A;
  }
  .candlestick-title {
    margin-left: 20px;
    font-size: 5px;
  }
</style>
