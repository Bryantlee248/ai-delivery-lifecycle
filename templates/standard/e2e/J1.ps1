$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot 'J1.mjs')
exit $LASTEXITCODE
