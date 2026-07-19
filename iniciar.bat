@echo off
cd /d "%~dp0"
title Semana Light - Admin
echo.
echo  === Semana Light Cacapava ===
echo.
echo  Abrindo servidor local...
echo.
echo  - Cardapio: http://localhost:8765/index.html
echo  - Admin:   http://localhost:8765/admin.html
echo.
echo  No painel Admin, clique em "Salvar no Servidor"
  echo  para salvar os produtos E fazer deploy automaticamente
  echo  em https://semana-light-cacapava-xi.vercel.app
  echo  (ou veja a URL exata no toast do Admin apos o deploy)
echo.
start http://localhost:8765/index.html
start http://localhost:8765/admin.html
python server.py
pause
