@echo off
title Maverick Fashion Store
if not exist .env copy .env.example .env
node server.js
pause
