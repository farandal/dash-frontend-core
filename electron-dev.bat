@echo off
vite build -c electron.vite.config.ts
cd apps\dash
start cmd /c yarn dev-win
cd ..\..\
timeout /t 5
electron .