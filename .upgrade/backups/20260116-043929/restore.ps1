$backupDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host 'Restoring from backup...'
Get-ChildItem -Path "$backupDir" -Exclude restore.ps1,metadata.json | Copy-Item -Destination . -Recurse -Force
git checkout v1.0-pre-upgrade
pnpm install
Write-Host 'Restored successfully'
