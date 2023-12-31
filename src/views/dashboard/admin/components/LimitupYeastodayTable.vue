<template>
  <div>
    <el-table
      v-if="list"
      :data="dataList"
      height="420"
      :tooltip-options="tooltipOptions"
    >
      <el-table-column :label="$t('table.stockName')" width="90px" align="left" fixed="left">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="name_search"
            size="mini"
            placeholder="名称"
          />
        </template>
        <template slot-scope="{row}">
          <span @click="handleNameClick(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="latest" label="昨日涨停价" width="75px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.latest }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="increase" :label="$t('table.increase')" width="75px" align="left">
        <template slot-scope="{row}">
          <span :style="{'color':row.increase>0?'red':'green'}">{{ row.increase }}%</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="currency_value" :label="$t('table.currency_value')" width="85px" align="left">
        <template slot-scope="{row}">
          <span>{{ (row.currency_value/Math.pow(10,8)).toFixed(0) }}亿</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.limit_up_type')" width="85px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.limit_up_type }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.high_days')" width="85px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.high_days }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="振幅" width="75px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.swing }}%</span>
        </template>
      </el-table-column> -->
      <el-table-column label="换手率" width="80px" align="left">
        <template slot-scope="{row}">
          <span>{{ (row.change_rate).toFixed(0) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="order_amount" :label="$t('table.order_amount')" sortable width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.order_amount>Math.pow(10,8)?(row.order_amount/Math.pow(10,8)).toFixed(1)+'亿':(row.order_amount/10000).toFixed(0)+'万' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="first_limit_up_time" :label="$t('table.first_limit_up_time')" width="85px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.first_limit_up_time | parseTime('{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.last_limit_up_time')" width="85px" align="left">
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

import { fetchStockHistoryRank, fetchStockZy, fetchStockCandlestick } from '@/api/stock'

export default {
  components: {
    CandlestickChart
  },
  props: {
    table_data: {
      type: Array
    }
  },
  data() {
    return {
      list: null,
      chart: null,
      chartData: [],
      reason_type_search: '',
      name_search: '',
      code: '',
      stockName: '',
      zyyw: '',
      tableLoading: false,
      candlestickLoading: false,
      popLoading: false,
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
        (!this.name_search || d.name.toLowerCase().includes(this.name_search.toLowerCase())) &&
        (!this.reason_type_search || d.reason_type.toLowerCase().includes(this.reason_type_search.toLowerCase()))
      )
    }
  },
  watch: {
    table_data: {
      handler(val) {
        this.list = val
      }
    }
  },
  created() {
    this.list = this.table_data
  },
  methods: {
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
      this.popLoading = true
      this.$nextTick(() => {
        // this.chart = echarts.init(this.$refs[code])
        setTimeout(() => {
          this.chart = echarts.init(this.$refs[code])
        }, 1000)
      })
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
    }
  }
}
</script>
<style scoped>
  .tooltip-container {
    width: 300px;
  }
  /* .candlestick-title {
    margin-left: 10px;
    font-size: 5px;
  } */
</style>
