$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$changes = git status --porcelain
if ($changes) {
    git add .
    $msg = "auto: " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
    git commit -m $msg
    git push
}
exit 0
