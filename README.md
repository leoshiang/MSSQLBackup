# MSSQLBackup

這是一個備份 SQL Server 資料庫的小工具，可以設定日備份、週備份和月備份。每種備份方式可以設定保留期間。支援 Windows/Linux/MacOS。

## 建立 .env 檔案

使用文字編輯器建立 .env 檔案

```
# 備份之後要執行的指令
AFTER_BACKUP_SCRIPT=

# 備份資料夾
BACKUP_DIR=C:\Temp

# 備份之前要執行的指令
BEFORE_BACKUP_SCRIPT=

# 是否壓縮備份檔案。如果是 yes，輸出檔會被壓縮成 .gz 檔案。
COMPRESS_OUTPUT_FILE=yes

# 每日備份保留週期，以天計算，７代表保留七天前到今天的備份。
DAILY_BACKUP_RETENTION_PERIOD=7

# 要備份的資料庫名稱，以逗號分隔。
DB_BACKUP_LIST=test,test2,test3

# 不備份的資料庫名稱，以逗號分隔。
DB_EXCLUDE_LIST=master,tempdb,model,msdb

# 資料庫主機，IP 或是名稱
DB_HOST=localhost

# 資料庫
DB_NAME=master

# 資料庫使用者密碼
DB_PASSWORD=

# 資料庫主機通訊埠
DB_PORT=1433

# 資料庫使用者名稱
DB_USERNAME=sa

# 通道是否會加密，同時略過驗證信任的憑證鏈結查核。
DB_TRUST_SERVER_CERTIFICATE=true

# 與伺服器之間傳送的所有資料使用 SSL 加密。
DB_ENCRYPT=true

# 在每月的幾號進行月備份。 1 = 代表個月的 1 號
MONTHLY_BACKUP_AT=19

# 月備份保留週期，以月計算，3 代表保留3個月前到這個月的備份。
MONTHLY_BACKUP_RETENTION_PERIOD=3

# 在星期幾進行週備份。 1 = 代表星期一
WEEKLY_BACKUP_AT=3

# 週備份保留週期，以週計算，4 代表保留4週前到這週的備份。
WEEKLY_BACKUP_RETENTION_PERIOD=4
```

## 執行程式

將`xdg-open` 與執行檔還有  .nev 放在同一個目錄。
> dxg-open 在 release 區域可以下載

Windows

```
MSSQLBackup
```

Linux

```bash
sudo ./MSSQLBackup
```
假設今天日期是 2024/06/19，根據 .env 的設定，執行的結果如下：

```text
讀取設定檔...
執行每日備份...
正在備份資料庫 test...
資料庫 test 已備份到 C:\Temp\daily\20240619-test.bak。
正在備份資料庫 test2...
資料庫 test2 已備份到 C:\Temp\daily\20240619-test2.bak。
正在備份資料庫 test3...
資料庫 test3 已備份到 C:\Temp\daily\20240619-test3.bak。
執行每週備份...
正在備份資料庫 test...
資料庫 test 已備份到 C:\Temp\weekly\week-2024-25-test.bak。
正在備份資料庫 test2...
資料庫 test2 已備份到 C:\Temp\weekly\week-2024-25-test2.bak。
正在備份資料庫 test3...
資料庫 test3 已備份到 C:\Temp\weekly\week-2024-25-test3.bak。
執行每月備份...
正在備份資料庫 test...
資料庫 test 已備份到 C:\Temp\monthly\month-2024-6-test.bak。
正在備份資料庫 test2...
資料庫 test2 已備份到 C:\Temp\monthly\month-2024-6-test2.bak。
正在備份資料庫 test3...
資料庫 test3 已備份到 C:\Temp\monthly\month-2024-6-test3.bak。
```

## 安裝建置執行檔時所需軟體

### pkg

```bash
npm install -g pkg
```

### VerMgr

1. 前往 VerMgr 下載最新的執行檔。

> https://github.com/leoshiang/VerMgr/releases

2. 在此 repo. 建立 VerMgr 目錄。
3. 將下載的 vermgr-win-x64-x.x.x-PROD-YYYYMMDD.exe 放在 VerMgr目錄。
4. 將 vermgr-win-x64-x.x.x-PROD-YYYYMMDD.exe 更名為 vermgr.exe。

## 建置執行檔

目前僅支援在 Windows 作業系統建置。

```bash
npm run build
```

輸出檔案會產生在 release 目錄裡面。

