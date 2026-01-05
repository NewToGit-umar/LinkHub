import { getMilestoneProgress, checkMilestones, formatMetricName } from '../services/milestoneService.js'

/**
 * Get milestone progress for the authenticated user
 */
export async function getProgress(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const progress = await getMilestoneProgress(userId)
    
    // Format the progress data for frontend
    const formattedProgress = Object.entries(progress).map(([metric, data]) => ({
      metric,
      displayName: formatMetricName(metric),
      ...data
    }))

    return res.status(200).json({ milestones: formattedProgress })
  } catch (err) {
    console.error('getProgress error:', err)
    return res.status(500).json({ message: 'Error fetching milestone progress', error: err.message })
  }
}

/**
 * Manually trigger milestone check (useful for testing)
 */
export async function triggerCheck(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const newMilestones = await checkMilestones(userId)
    
    return res.status(200).json({ 
      message: 'Milestone check complete',
      newMilestones: newMilestones.map(m => ({
        metric: m.metric,
        displayName: formatMetricName(m.metric),
        achieved: m.value,
        current: m.currentValue
      }))
    })
  } catch (err) {
    console.error('triggerCheck error:', err)
    return res.status(500).json({ message: 'Error checking milestones', error: err.message })
  }
}
