# Regenerate SPA Segment Team Review: MD -> HTML -> PDF (Edge headless)
# Usage: from repo root: .\docs\export-team-review.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Docs = $PSScriptRoot
$Desktop = Join-Path $env:USERPROFILE "OneDrive\Рабочий стол\SPA-SEGMENT-TEAM-REVIEW.pdf"

Push-Location $Root
try {
  if (-not (Test-Path "node_modules\marked")) {
    Write-Host "Installing marked (no-save)..."
    npm install --no-save marked | Out-Null
  }
  node "$Docs\build-team-review-pdf.mjs"
  if (-not (Test-Path "$Docs\SPA-SEGMENT-TEAM-REVIEW.pdf")) {
    throw "PDF not created: $Docs\SPA-SEGMENT-TEAM-REVIEW.pdf"
  }
  $sizeMb = [math]::Round((Get-Item "$Docs\SPA-SEGMENT-TEAM-REVIEW.pdf").Length / 1MB, 2)
  Write-Host ""
  Write-Host "Готово ($sizeMb MB):"
  Write-Host "  HTML: $Docs\SPA-SEGMENT-TEAM-REVIEW.html"
  Write-Host "  PDF:  $Docs\SPA-SEGMENT-TEAM-REVIEW.pdf"
  if (Test-Path $Desktop) {
    Write-Host "  Копия: $Desktop"
  } else {
    Write-Warning "Копия на рабочий стол не найдена: $Desktop"
  }
}
finally {
  Pop-Location
}
