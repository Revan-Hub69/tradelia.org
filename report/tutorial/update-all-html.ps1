# Script per aggiornare tutti i file HTML al template corretto
$templateFile = "index.html"
$template = Get-Content $templateFile -Raw -Encoding UTF8

$files = Get-ChildItem *.html | Where-Object { 
    $_.Name -notlike "_*" -and 
    $_.Name -ne "index.html" -and 
    $_.Name -ne "tutorials.html" 
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -notmatch "og:type") {
        [System.IO.File]::WriteAllText($file.FullName, $template, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Done!"

