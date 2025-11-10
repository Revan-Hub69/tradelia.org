# Script per salvare screenshot chart nel report
# Uso: .\save-chart-screenshot.ps1 -ReportId "sample-id" -ImagePath "path\to\screenshot.png"

param(
    [Parameter(Mandatory=$true)]
    [string]$ReportId,
    
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

$reportDir = "report\reports\$ReportId"
$targetPath = "$reportDir\chart-snapshot.png"

# Crea directory se non esiste
if (-not (Test-Path $reportDir)) {
    Write-Host "Creo directory: $reportDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

# Verifica che il file sorgente esista
if (-not (Test-Path $ImagePath)) {
    Write-Host "Errore: File sorgente non trovato: $ImagePath" -ForegroundColor Red
    exit 1
}

# Copia il file
Copy-Item -Path $ImagePath -Destination $targetPath -Force

Write-Host "✅ Screenshot salvato: $targetPath" -ForegroundColor Green
Write-Host "Il sistema userà automaticamente questo screenshot al posto del TradingView LIVE" -ForegroundColor Cyan

