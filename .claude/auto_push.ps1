$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$stat = git diff HEAD --numstat 2>$null
if (-not $stat) { exit 0 }

$totalChanged = 0
$totalOrig = 0

foreach ($line in ($stat -split "`n")) {
    if ($line -match '^(\d+)\s+(\d+)\s+(.+)$') {
        $added   = [int]$Matches[1]
        $removed = [int]$Matches[2]
        $filepath = Join-Path $root $Matches[3].Trim()

        if (Test-Path $filepath) {
            $cur  = (Get-Content $filepath -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
            $orig = $cur - $added + $removed
            if ($orig -gt 0) {
                $totalChanged += $added + $removed
                $totalOrig    += $orig
            }
        }
    }
}

if ($totalOrig -gt 0 -and ($totalChanged / $totalOrig) -ge 0.3) {
    git add .
    $msg = "auto(30%+): " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
    git commit -m $msg
    git push
}

exit 0
