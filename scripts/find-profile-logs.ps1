# Script PowerShell pour trouver les logs de création de profil dans le terminal
# Utilisez ce script pour filtrer les logs du serveur Next.js

Write-Host "Recherche des logs de création de profil..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Messages à chercher:" -ForegroundColor Yellow
Write-Host "  - [API] Profil inexistant, création avec 5 crédits..."
Write-Host "  - [API] ✅ Profil créé pour l'utilisateur"
Write-Host "  - [API] Erreur lors de la création du profil"
Write-Host "  - [API] Récupération du profil pour l'utilisateur"
Write-Host "  - [API] Résultat de la récupération du profil"
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Green
Write-Host "1. Copiez tout le contenu du terminal du serveur (Ctrl+A, Ctrl+C)"
Write-Host "2. Collez-le dans un fichier temporaire (ex: server-logs.txt)"
Write-Host "3. Exécutez cette commande:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Get-Content server-logs.txt | Select-String -Pattern 'API.*Profil|API.*créé|API.*Erreur.*création|API.*Récupération.*profil' -CaseSensitive:`$false"
Write-Host ""
Write-Host "OU utilisez cette commande pour voir les 50 dernières lignes pertinentes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Get-Content server-logs.txt | Select-String -Pattern 'API.*Profil|API.*créé|API.*Erreur|API.*Récupération' -CaseSensitive:`$false | Select-Object -Last 50"
Write-Host ""




