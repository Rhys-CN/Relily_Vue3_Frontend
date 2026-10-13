// 定时任务展示解析工具：将调用目标字符串和 cron 表达式转成人类可读的中文描述

/**
 * 解析调用目标字符串 beanName.methodName('arg', true, 2000L, 316.50D, 100)
 * 返回 { bean, method, args, argsText, text }
 */
export function parseInvokeTarget(target) {
  if (!target) return null
  const str = target.trim()
  const match = str.match(/^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)(?:\((.*)\))?$/)
  if (!match) return null
  const bean = match[1]
  const method = match[2]
  const argsStr = (match[3] || '').trim()
  let args = []
  if (argsStr) {
    args = argsStr.split(',').map(a => a.trim()).filter(Boolean)
  }
  const typeMap = {
    L: '长整型', D: '浮点型', F: '浮点型'
  }
  const argsText = args.length
    ? args.map(a => {
        const lower = a.toLowerCase()
        if (lower === 'true' || lower === 'false') return `布尔值 ${a}`
        if (a.endsWith('L')) return `长整型 ${a.slice(0, -1)}`
        if (a.endsWith('D') || a.endsWith('F')) return `浮点型 ${a.slice(0, -1)}`
        if (a.startsWith("'") && a.endsWith("'")) return `字符串 ${a}`
        if (a.startsWith('"') && a.endsWith('"')) return `字符串 ${a}`
        if (/^-?\d+$/.test(a)) return `整型 ${a}`
        return `参数 ${a}`
      }).join('，')
    : '无参数'
  return { bean, method, args, argsText, text: `${bean}.${method}(${argsStr})` }
}

/**
 * 解析 cron 表达式为中文描述（支持 6/7 段标准 quartz cron）
 * 返回描述字符串，解析失败返回 null
 */
export function parseCronExpression(expr) {
  if (!expr) return null
  const parts = String(expr).trim().split(/\s+/)
  if (parts.length < 6 || parts.length > 7) return null

  const fields = {
    second: parts[0],
    minute: parts[1],
    hour: parts[2],
    day: parts[3],
    month: parts[4],
    week: parts[5]
  }
  const year = parts.length === 7 ? parts[6] : null

  const descs = []
  descs.push(describeField(fields.second, '秒'))
  descs.push(describeField(fields.minute, '分'))
  descs.push(describeField(fields.hour, '时'))
  descs.push(describeDay(fields.day, fields.week))
  descs.push(describeField(fields.month, '月'))
  if (year && year !== '*') {
    descs.push(`${year} 年`)
  }
  return descs.filter(Boolean).join('，') || null
}

function describeField(value, unit) {
  if (value === '*' || value === '?') return null
  // 步进 0/5 或 */5
  let m = value.match(/^(\d+|\*)\/(\d+)$/)
  if (m) {
    const start = m[1] === '*' ? 0 : parseInt(m[1], 10)
    return `从第${start}${unit}开始每${m[2]}${unit}执行一次`
  }
  // 范围 1-5
  m = value.match(/^(\d+)-(\d+)$/)
  if (m) {
    return `第${m[1]}到第${m[2]}${unit}`
  }
  // 列表 1,3,5
  if (value.includes(',')) {
    const items = value.split(',').map(v => v.trim())
    if (items.every(v => /^\d+$/.test(v))) {
      return `第${items.join('、')}${unit}`
    }
  }
  if (/^\d+$/.test(value)) {
    return `第${value}${unit}`
  }
  if (value === '*') return `每${unit}`
  return null
}

function describeDay(day, week) {
  // 日与星期互斥，谁不是 ? 或 * 描述谁
  const dayIsSet = day && day !== '?' && day !== '*'
  const weekIsSet = week && week !== '?' && week !== '*'
  if (dayIsSet && weekIsSet) return `第${day}日（星期${week}）`
  if (dayIsSet) {
    if (day === 'L') return '每月最后一天'
    if (day === 'LW') return '每月最后一个工作日'
    if (day.endsWith('L')) return `每月最后一个${day.slice(0, -1)}日`
    if (day.startsWith('L-')) return `每月倒数第${day.slice(2)}天`
    const m = day.match(/^(\d+)\/(\d+)$/)
    if (m) return `从第${m[1]}日开始每${m[2]}天执行一次`
    return describeField(day, '日') || '每日'
  }
  if (weekIsSet) {
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    if (week === 'L') return '每周最后一天(周六)'
    if (/^(\d+)#(\d+)$/.test(week)) {
      const [, w, n] = week.match(/^(\d+)#(\d+)$/)
      return `每月第${n}个${weekNames[parseInt(w, 10) % 7]}`
    }
    if (week.includes(',')) {
      const items = week.split(',').map(v => weekNames[parseInt(v, 10) % 7]).join('、')
      return `每${items}`
    }
    const m = week.match(/^(\d+)-(\d+)$/)
    if (m) {
      return `${weekNames[parseInt(m[1], 10) % 7]}到${weekNames[parseInt(m[2], 10) % 7]}`
    }
    return weekNames[parseInt(week, 10) % 7] || `星期${week}`
  }
  return '每日'
}