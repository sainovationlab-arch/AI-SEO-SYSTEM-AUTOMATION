@echo off
echo ===================================================
echo AI Visibility Platform - Git Setup Script
echo ===================================================

echo [1/5] Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Error: Failed to initialize git.
    pause
    exit /b %errorlevel%
)

echo [2/5] Adding files to staging...
git add .

echo [3/5] Creating initial commit...
git commit -m "Initial commit: Infrastructure and Sales System Base"

echo [4/5] Renaming branch to main...
git branch -M main

echo ===================================================
echo Current Git Status:
git status
echo ===================================================

set /p remote_url="Enter your GitHub Repository URL (e.g., https://github.com/username/repo.git): "

if "%remote_url%"=="" (
    echo No URL provided. Skipping remote configuration.
    echo You can run 'git remote add origin <url>' later.
) else (
    echo [5/5] Adding remote origin and pushing...
    git remote add origin %remote_url%
    git push -u origin main
)

echo ===================================================
echo Setup Complete!
echo ===================================================
pause
