$ErrorActionPreference = "Stop"

Write-Host "OpenWork setup"
if (-not (Test-Path ".env") -and (Test-Path ".env.template")) {
    Copy-Item ".env.template" ".env"
    Write-Host "Created .env from .env.template"
}

python -m pip install -r requirements.txt
python config_generator.py cursor ./mcps

Write-Host "Generated Cursor MCP config. Edit .env with your keys before use."
