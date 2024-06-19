const Utils = require('./Utils')
const child_process = require('node:child_process')
const fs = require('fs')
const path = require('path')
const sql = require('mssql')

class BackupAction {

    /**
     *
     * @param {Config} config
     */
    constructor (config) {
        /**
         * 備份設定。
         * @type {Config}
         * @protected
         */
        this._config = config

        /**
         * 要備份的資料庫名稱列表。
         * @type {null|string[]}
         * @protected
         */
        this._dbBackupList = null
    }

    /**
     * 執行備份之後的指令。
     * @protected
     * @return {void}
     */
    _afterExecute () {
        if (!this._config.afterBackupScript) return
        child_process.execSync(this._config.afterBackupScript)
    }

    /**
     * 執行備份前的指令。
     * @protected
     * @return {void}
     */
    _beforeExecute () {
        if (!this._config.beforeBackupScript) return
        child_process.execSync(this._config.beforeBackupScript)
    }

    /**
     * 取得資料庫備份清單。
     * 如果沒有在設定檔的 DB_BACKUP_LIST 設定，就用全部的資料庫取代。
     * @protected
     * @returns {Promise<void>}
     */
    async _createDbBackupList () {
        this._dbBackupList = this._config.dbBackupList === '' ? await this._getDbNameList() : this._parseDbBackupList()
        const excludeList = await this._getDbExcludeList()
        this._dbBackupList = this._dbBackupList.filter(x => !excludeList.includes(x))
    }

    /**
     * 刪除檔案。
     * @param {string} filePath 完整檔案名稱。
     * @private
     */
    _deleteFile (filePath) {
        try {
            fs.unlinkSync(filePath)
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * 刪除舊的備份檔案。
     * @param {string} fileName 檔案名稱。
     * @protected
     * @return {void}
     */
    _deleteOldBackupFile (fileName) {
        console.log(`刪除舊的備份檔案 ${fileName}。`)
        const filePath = this._getBackupDirectory() + path.sep + fileName
        this._deleteFile(filePath)
    }

    /**
     * 刪除舊的備份檔。
     * @protected
     * @return {void}
     */
    _deleteOldBackups () {
        if (!this._isRetentionPeriodValid()) return
        const retentionStartDate = this._getRetentionStartDate()
        let files = fs.readdirSync(this._getBackupDirectory())
        let oldBackupFiles = files.filter(x => this._isOldBackupFile(x, retentionStartDate))
        oldBackupFiles.forEach(x => this._deleteOldBackupFile(x))
    }

    /**
     * 執行備份。
     * @protected
     * @return {void}
     */
    _doBackup () {
        this._ensureDirectory()
        for (let i = 0; i < this._dbBackupList.length; i++) {
            const dbName = this._dbBackupList[i]
            const outputFileName = this._getOutputFileName(dbName)
            console.log(`正在備份資料庫 ${dbName}...`)
            const command = `BACKUP DATABASE ${dbName} TO DISK = '${outputFileName}'`
            try {
                sql.query(command)
            } catch (error) {
                console.error(`備份 ${dbName} 發生錯誤: ${error} 。`)
            }
            console.log(`資料庫 ${dbName} 已備份到 ${outputFileName}。`)
        }
    }

    /**
     * 確保備份目錄存在，不存在就建立。
     */
    _ensureDirectory () {
        const backupDirectory = this._getBackupDirectory()
        try {
            if (!fs.existsSync(backupDirectory)) {
                console.log(`目錄 ${backupDirectory} 不存在，嘗試建立...`)
                fs.mkdirSync(backupDirectory)
                console.log(`已建立目錄 ${backupDirectory}。`)
            }
        } catch (err) {
            Utils.stopExecution(`建立 ${backupDirectory} 時發生錯誤：${err}`)
        }
    }

    /**
     * 取得備份目錄。
     * @protected
     * @return {string}
     */
    _getBackupDirectory () {
        throw new Error('請在子類別中實作此方法。')
    }

    /**
     * 建立資料庫連線物件。
     * @protected
     * @returns {Client}
     */
    _getDbConfig () {
        return {
            user: this._config.dbUserName,
            password: this._config.dbPassword,
            database: this._config.dbName,
            server: this._config.dbHost,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options: {
                encrypt: this._config.dbEncrypt,
                trustServerCertificate: this._config.dbTrustServerCertificate
            }
        }
    }

    /**
     * 取得不備份的資料庫名稱列表
     * @returns {Promise<string[]>}
     * @protected
     */
    async _getDbExcludeList () {
        return this._config.dbExcludeList.split(',')
            .map(x => x.trim())
            .filter(x => x !== '')
    }

    /**
     * 取得資料庫名稱列表。
     * @protected
     * @returns {Promise<*[string]>}
     */
    async _getDbNameList () {
        let dbNameList
        try {
            await sql.connect(this._getDbConfig())
            const result = await sql.query('SELECT name FROM sys.databases;')
            dbNameList = result.recordset.map(x => x.name)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
        return dbNameList
    }

    /**
     * 取得輸出檔案名稱
     * @param {string} dbName 資料庫名稱
     * @returns {string}
     * @protected
     */
    _getOutputFileName (dbName) {
        throw new Error('請在子類別中實作此方法。')
    }

    /**
     * 取得備份檔案保留起始日期
     * @protected
     * @return {moment.Moment}
     */
    _getRetentionStartDate () {
        throw new Error('請在子類別中實作此方法。')
    }

    /**
     * 檔案是否為舊的?
     * @param {string} fileName 檔案名稱。
     * @param {moment.Moment} retentionStartDate 備份保留起始日期。
     * @protected
     * @return {boolean}
     */
    _isOldBackupFile (fileName, retentionStartDate) {
        throw new Error('請在子類別中實作此方法。')
    }

    /**
     * 檢查保留期間是否有效。
     * @private
     * @return {boolean}
     */
    _isRetentionPeriodValid () {
        throw new Error('Method not implemented.')
    }

    /**
     * 解析設定檔的 DB_BACKUP_LIST 以取得資料庫備份清單。
     * @return {string[]}
     * @protected
     */
    _parseDbBackupList () {
        return this._config.dbBackupList.split(',')
            .map(x => x.trim())
            .filter(x => x !== '')
    }

    /**
     * 執行備份。
     * @returns {Promise<void>}
     */
    async execute () {
        try {
            this._beforeExecute()
            await this._createDbBackupList()
            this._doBackup()
            this._deleteOldBackups()
        } finally {
            this._afterExecute()
        }
    }
}

module.exports = BackupAction