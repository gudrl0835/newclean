$filePath = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"

Write-Host "Step 1: my.ini 한글 파일명 수정..." -ForegroundColor Yellow
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::Default)
$content = $content -replace 'general_log_file="[^"]+"', 'general_log_file="mysql-general.log"'
$content = $content -replace 'slow_query_log_file="[^"]+"', 'slow_query_log_file="mysql-slow.log"'
$content = $content -replace 'log-error="[^"]+"', 'log-error="mysql.err"'
$content = $content -replace 'log-bin="[^"]+"', 'log-bin="mysql-bin"'
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::Default)
Write-Host "my.ini 수정 완료!" -ForegroundColor Green

Write-Host "Step 2: 기존 MySQL80 서비스 제거..." -ForegroundColor Yellow
Stop-Service MySQL80 -Force -ErrorAction SilentlyContinue
& "$mysqlBin\mysqld.exe" --remove MySQL80 2>$null
Start-Sleep -Seconds 2
Write-Host "서비스 제거 완료!" -ForegroundColor Green

Write-Host "Step 3: MySQL80 서비스 새로 설치..." -ForegroundColor Yellow
& "$mysqlBin\mysqld.exe" --install MySQL80 --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
Start-Sleep -Seconds 2
Write-Host "서비스 설치 완료!" -ForegroundColor Green

Write-Host "Step 4: MySQL 서비스 시작..." -ForegroundColor Yellow
Start-Service MySQL80
Start-Sleep -Seconds 5

$svc = Get-Service MySQL80 -ErrorAction SilentlyContinue
if ($svc.Status -eq "Running") {
    Write-Host "MySQL 서비스 실행중! 접속 정보:" -ForegroundColor Green
    Write-Host "  Host: localhost" -ForegroundColor Cyan
    Write-Host "  User: root" -ForegroundColor Cyan
    Write-Host "  Password: (없음)" -ForegroundColor Cyan
    Write-Host "  Port: 3307" -ForegroundColor Cyan
} else {
    Write-Host "서비스 상태: $($svc.Status) - 로그 확인 필요" -ForegroundColor Red
    Get-Content "C:\ProgramData\MySQL\MySQL Server 8.0\Data\mysql.err" -Tail 20 -ErrorAction SilentlyContinue
}

Read-Host "Enter 키를 눌러 종료"
