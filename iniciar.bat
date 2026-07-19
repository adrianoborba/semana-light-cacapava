@echo off
cd /d "%~dp0"
title Semana Light - Admin
color 0A
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                 Semana Light Cacapava                      ║
echo  ║                   Painel de Administração                  ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Iniciando servidor local em http://localhost:8765
echo.
echo  ┌─────────────────────────────────────────────────────────┐
echo  │ URLS DE ACESSO:                                         │
echo  │ ▸ Cardapio:  http://localhost:8765/index.html           │
echo  │ ▸ Admin:     http://localhost:8765/admin.html           │
echo  └─────────────────────────────────────────────────────────┘
echo.
echo  ┌─────────────────────────────────────────────────────────┐
echo  │ FLUXO DE USO:                                           │
echo  │ 1. Edite os produtos no Admin                           │
echo  │ 2. Salve e feche o Admin                                │
echo  │ 3. DUPLO-CLIQUE EM: enviar-para-git.bat                 │
echo  │ 4. Aguarde 5-10 segundos e o site atualiza em prod      │
echo  │    https://semana-light-cacapava-xi.vercel.app          │
echo  └─────────────────────────────────────────────────────────┘
echo.
echo  Abrindo abas do navegador...
echo.
start http://localhost:8765/index.html
start http://localhost:8765/admin.html
python server.py
pause
