@echo off
cd /d "%~dp0"
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
