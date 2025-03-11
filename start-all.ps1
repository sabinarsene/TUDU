# Script PowerShell pentru pornirea întregii aplicații
Write-Host "Pornire aplicație TUDU..." -ForegroundColor Green

# Verificăm dacă serverul backend este pornit
Write-Host "Verificare server backend..." -ForegroundColor Cyan
node check-server.js

# Pornim backend-ul în fundal
Write-Host "Pornire backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd tudu-backend; ./start-server.ps1"

# Așteptăm puțin pentru a permite backend-ului să pornească
Write-Host "Așteptăm pornirea backend-ului..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificăm din nou dacă serverul backend este pornit
Write-Host "Verificare server backend după pornire..." -ForegroundColor Cyan
node check-server.js

# Pornim frontend-ul
Write-Host "Pornire frontend..." -ForegroundColor Cyan
npm start 