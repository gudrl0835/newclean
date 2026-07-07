$filePath = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
Write-Host "my.ini 수정 중..." -ForegroundColor Yellow
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::Default)
$content = $content -replace 'general_log_file="[^"]+"', 'general_log_file="mysql-general.log"'
$content = $content -replace 'slow_query_log_file="[^"]+"', 'slow_query_log_file="mysql-slow.log"'
$content = $content -replace 'log-error="[^"]+"', 'log-error="mysql.err"'
$content = $content -replace 'log-bin="[^"]+"', 'log-bin="mysql-bin"'
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::Default)
Write-Host "my.ini 수정 완료!" -ForegroundColor Green

Write-Host "Data 폴더 초기화 중..." -ForegroundColor Yellow
$dataDir = "C:\ProgramData\MySQL\MySQL Server 8.0\Data"
if (Test-Path $dataDir) {
    Get-ChildItem $dataDir | Remove-Item -Recurse -Force
    Write-Host "Data 폴더 초기화 완료!" -ForegroundColor Green
}

Write-Host "MySQL 초기화 중..." -ForegroundColor Yellow
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
& $mysqlBin --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --initialize-insecure --console
Write-Host "초기화 완료!" -ForegroundColor Green

Write-Host "MySQL 서비스 시작 중..." -ForegroundColor Yellow
Start-Service MySQL80
Start-Sleep -Seconds 5
Write-Host "완료! SQLyog에서 root / 비밀번호없음 / 포트3307 로 접속하세요." -ForegroundColor Green
Read-Host "Enter 키를 눌러 종료"
