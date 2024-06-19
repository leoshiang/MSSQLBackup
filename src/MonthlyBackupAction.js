const path = require('path')
const moment = require('moment')
const BackupAction = require('./BackupAction')

/**
 * 每日備份
 * @class
 */
class MonthlyBackupAction extends BackupAction {
    constructor (iConfig) {
        super(iConfig)
    }

    /**
     * 取得備份目錄。
     * @private
     * @return {string}
     */
    _getBackupDirectory () {
        return this._config.monthlyBackupDir
    }

    /**
     * 取得輸出檔案名稱。
     * @param {string} dbName 資料庫名稱。
     * @protected
     * @returns {string}
     */
    _getOutputFileName (dbName) {
        const today = new moment()
        const year = today.year()
        const monthNumber = today.month() + 1
        return this._config.monthlyBackupDir + path.sep
            + `month-${year}-${monthNumber}-`
            + dbName + '.bak'
    }

    /**
     * 取得備份檔案保留起始日期
     * @private
     * @return {moment.Moment}
     */
    _getRetentionStartDate () {
        const today = new moment()
        const retentionPeriod = this._config.monthlyBackupRetentionPeriod
        return today.subtract(retentionPeriod, 'weeks')
    }

    /**
     * 檔案是否為舊的?
     * @param {string} fileName 檔案名稱。
     * @param {moment.Moment} retentionStartDate 備份保留起始日期。
     * @protected
     * @return {boolean}
     */
    _isOldBackupFile (fileName, retentionStartDate) {
        const regex = new RegExp('^month-(\\d+)-(\\d+)-.*')
        const match = regex.exec(fileName)
        if (!match) return false
        const backupMonthNumber = match[1].toString()
        const retentionStartMonth = retentionStartDate.month()
        return backupMonthNumber <= retentionStartMonth
    }

    /**
     * 檢查保留期間是否有效。
     * @private
     * @return {boolean}
     */
    _isRetentionPeriodValid () {
        if (isNaN(this._config.monthlyBackupRetentionPeriod)) return false
        return this._config.monthlyBackupRetentionPeriod > 0
    }
}

module.exports = MonthlyBackupAction