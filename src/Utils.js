/**
 * 顯示錯誤訊息並停止執行
 * @param {string} errorMessage 錯誤訊息
 */
function stopExecution (errorMessage) {
    console.error(errorMessage)
    process.exit(1)
}

/**
 * 文字轉整數。
 * @param {string} str 文字。
 * @private
 * @return {number} 整數。
 */
function strToInt (str) {
    const regex = new RegExp('(\\d+)', 'g')
    const match = regex.exec((str || '').trim())
    if (!match) return NaN
    return parseInt(match[1], 10)
}

module.exports = { stopExecution, strToInt }