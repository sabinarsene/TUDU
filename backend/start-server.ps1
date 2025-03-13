# Script PowerShell pentru pornirea serverului backend

# Verificăm dacă modulele Node.js necesare sunt instalate
Write-Host "Verificare module Node.js..." -ForegroundColor Green
$modules = @("axios", "express", "cors", "dotenv")
foreach ($module in $modules) {
    if (-not (Test-Path "node_modules/$module")) {
        Write-Host "Instalare modul $module..." -ForegroundColor Yellow
        npm install $module
    }
}

Write-Host "Verificare tabele în baza de date..." -ForegroundColor Green
node check-db-tables.js

Write-Host "Creare tabel user_ratings și adăugare evaluări de test..." -ForegroundColor Green
node create-ratings-table.js

Write-Host "Verificare rute API..." -ForegroundColor Green
node check-routes.js

Write-Host "Testare endpoint-uri pentru evaluări..." -ForegroundColor Green
node test-ratings-endpoint.js

# Pornim serverul
Write-Host "Pornire server..." -ForegroundColor Green
node server.js 