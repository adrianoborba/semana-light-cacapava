@echo off
cd /d "%~dp0"
color 0A
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║         Enviando products.json para Git e Vercel           ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

echo  [1/3] Adicionando arquivo ao Git...
git add products.json
if errorlevel 1 goto error

echo  [2/3] Fazendo commit...
git commit -m "Update products"
if errorlevel 1 goto warning

echo  [3/3] Fazendo push...
git push
if errorlevel 1 goto error

echo.
echo  ✅ Enviado com sucesso!
echo.
echo  O Vercel atualizará o site em 5-10 segundos:
echo  https://semana-light-cacapava-xi.vercel.app
echo.
pause
exit /b 0

:warning
echo.
echo  ⚠️  Aviso: Nenhuma mudança para fazer commit
echo.
pause
exit /b 0

:error
echo.
echo  ❌ Erro ao enviar para Git
echo.
pause
exit /b 1
