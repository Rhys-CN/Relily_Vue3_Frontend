import request from '@/utils/request'

// 查询预约列表
export function listAppointment(query) {
  return request({
    url: '/system/cosmeticsAppointment/list',
    method: 'get',
    params: query
  })
}

// 查询预约详细
export function getAppointment(id) {
  return request({
    url: '/system/cosmeticsAppointment/' + id,
    method: 'get'
  })
}

// 买家下单预约
export function addAppointment(data) {
  return request({
    url: '/system/cosmeticsAppointment',
    method: 'post',
    data: data
  })
}

// 修改预约(买家)
export function updateAppointment(data) {
  return request({
    url: '/system/cosmeticsAppointment',
    method: 'put',
    data: data
  })
}

// 取消预约
export function cancelAppointment(id) {
  return request({
    url: '/system/cosmeticsAppointment/cancel',
    method: 'put',
    data: { id }
  })
}

// 卖家确认预约
export function confirmAppointment(id) {
  return request({
    url: '/system/cosmeticsAppointment/confirm',
    method: 'put',
    data: { id }
  })
}

// 卖家发货
export function shipAppointment(data) {
  return request({
    url: '/system/cosmeticsAppointment/ship',
    method: 'put',
    data: data
  })
}

// 查询物流轨迹
export function getExpressTrack(id) {
  return request({
    url: '/system/cosmeticsAppointment/express/track',
    method: 'get',
    params: { id }
  })
}

// 删除预约
export function delAppointment(id) {
  return request({
    url: '/system/cosmeticsAppointment/' + id,
    method: 'delete'
  })
}