#!/usr/bin/env node

require('dotenv').config()
const ConfigBuilder = require('./src/ConfigBuilder')
const DailyBackupAction = require('./src/DailyBackupAction')
const WeeklyBackupAction = require('./src/WeeklyBackupAction')
const MonthlyBackupAction = require('./src/MonthlyBackupAction')
const moment = require('moment');

(async () => {
    console.log('讀取設定檔...')
    const config = ConfigBuilder.build()
    await doDailyBackup(config)
    await doWeeklyBackup(config)
    await doMonthlyBackup(config)
    console.log('收工!')
    process.exit(0)
})()

async function doDailyBackup (config) {
    console.log('執行每日備份...')
    await new DailyBackupAction(config).execute()
}

async function doWeeklyBackup (config) {
    const dayOfWeek = moment().isoWeekday()
    if (dayOfWeek !== config.weeklyBackupAt) return
    console.log('執行每週備份...')
    await new WeeklyBackupAction(config).execute()
}

async function doMonthlyBackup (config) {
    const dateOfMonth = moment().date()
    if (dateOfMonth !== config.monthlyBackupAt) return
    console.log('執行每月備份...')
    await new MonthlyBackupAction(config).execute()
}