import request from '@/utils/request'

export function fetchLimitUpList(query) {
  return request({
    url: '/data/limitup/list',
    method: 'get',
    params: query
  })
}

export function fetchStockCandlestick(query) {
  return request({
    url: '/data/candlestick',
    method: 'get',
    timeout: 20000,
    params: query
  })
}

export function fetchStockHistoryRank(query) {
  return request({
    url: '/data/historyRank',
    method: 'get',
    timeout: 0,
    params: query
  })
}

export function fetchLimitupTwoList(query) {
  return request({
    url: '/data/limitup_two/list',
    method: 'get',
    timeout: 0,
    params: query
  })
}

export function fetchConceptStockList(query) {
  return request({
    url: '/data/conceptStock/list',
    method: 'get',
    timeout: 0,
    params: query
  })
}

export function fetchConceptList() {
  return request({
    url: '/data/concept/list',
    method: 'get',
    timeout: 0
  })
}

export function fetchTrendComment(query) {
  return request({
    url: '/data/trendcomment/list',
    method: 'get',
    timeout: 10000,
    params: query
  })
}

export function saveTrendComment(query) {
  return request({
    headers: { 'Content-Type': 'application/json' },
    url: '/data/trendcomment/save',
    method: 'post',
    data: query
  })
}

export function deleteProduct(query) {
  return request({
    url: '/data/product/delete',
    method: 'delete',
    params: query
  })
}

export function fetchKeepaData(query) {
  return request({
    url: '/data/product/keepadata/list',
    method: 'get',
    params: query
  })
}
