import cron from 'node-cron'
import analyticsService from './analyticsService.js'

let job = null

export function startAnalyticsScheduler() {
  if (job) return job
  // run every hour at minute 5
  job = cron.schedule('5 * * * *', async () => {
    try {
      const total = await analyticsService.ingestForAllUsers()
      console.log('Analytics scheduler ingested', total, 'records')
    } catch (err) {
      console.error('Analytics scheduler error', err)
    }
  })

  // run once immediately
  analyticsService.ingestForAllUsers().then(total => console.log('Analytics initial ingest', total)).catch(err => console.error(err))
  console.log('✅ Analytics scheduler started (hourly)')
  return job
}

export function stopAnalyticsScheduler() {
  if (job) job.stop()
}
