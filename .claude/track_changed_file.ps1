$json = $input | ConvertFrom-Json
$fp = $json.tool_input.file_path
if ($fp -and ($fp -match '\.(java|jsx|js)$')) {
    Add-Content -Path (Join-Path $PSScriptRoot 'changed_files.txt') -Value $fp -Force
}
exit 0
