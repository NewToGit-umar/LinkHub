import analyticsService from './analyticsService.js'

let job = null

function createHourlyJob(fn) {
  const intervalMs = 60 * 60 * 1000 // 1 hour
  const id = setInterval(fn, intervalMs)
  return { stop: () => clearInterval(id) }
}

export function startAnalyticsScheduler() {
  if (job) return job

  job = createHourlyJob(async () => {
    try {
      const total = await analyticsService.ingestForAllUsers()
      console.log('Analytics scheduler ingested', total, 'records')
    } catch (err) {
      console.error('Analytics scheduler error', err)
    }
  })

  // run once immediately
  analyticsService.ingestForAllUsers().then(total => console.log('Analytics initial ingest', total)).catch(err => console.error(err))
  console.log('✅ Analytics scheduler started (hourly via setInterval)')
  return job
}

export function stopAnalyticsScheduler() {
  if (job) job.stop()
}
