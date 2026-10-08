$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot 'integration.mjs')
exit $LASTEXITCODE
