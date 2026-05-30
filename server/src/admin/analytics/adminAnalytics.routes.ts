import { Router } from 'express'
import { AdminAnalyticsController } from './adminAnalytics.controller.js'

const router = Router()

router.get('/overview',            AdminAnalyticsController.overview)
router.get('/user-growth',         AdminAnalyticsController.userGrowth)
router.get('/listings-by-industry',AdminAnalyticsController.listingsByIndustry)
router.get('/listings-by-country', AdminAnalyticsController.listingsByCountry)
router.get('/deal-funnel',         AdminAnalyticsController.dealFunnel)
router.get('/recent-activity',     AdminAnalyticsController.recentActivity)

export default router