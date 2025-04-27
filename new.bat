@echo off
setlocal EnableDelayedExpansion

:: Get app name from user input and clean it
set /p "app_name=Enter the new app name: "
:: Convert to lowercase and remove spaces
for %%a in ("A=a" "B=b" "C=c" "D=d" "E=e" "F=f" "G=g" "H=h" "I=i" "J=j" "K=k" "L=l" "M=m" "N=n" "O=o" "P=p" "Q=q" "R=r" "S=s" "T=t" "U=u" "V=v" "W=w" "X=x" "Y=y" "Z=z") do (
    set "app_name=!app_name:%%~a!"
)
set "app_name=!app_name: =!"

:: Source directory
set "src_dir=apps\demo"

:: Destination directory (will always be apps/dash)
set "dest_dir=apps\dash"

:: Check if source directory exists
if not exist "%src_dir%" (
    echo "Error: Source directory %src_dir% does not exist"
    exit /b 1
)

:: Check if destination already exists
if exist "%dest_dir%" (
    echo "Warning: Destination directory %dest_dir% already exists"
    set /p "confirm=Do you want to remove it and continue? (y/n): "
    if /i not "!confirm!"=="y" (
        echo "Operation canceled"
        exit /b 1
    )
    
    :: Clean up existing submodule if it exists
    findstr /m "%dest_dir%" .gitmodules >nul 2>&1
    if not errorlevel 1 (
        echo "Cleaning up existing submodule reference..."
        git submodule deinit -f -- "%dest_dir%" 2>nul
        git rm -f "%dest_dir%" 2>nul
        rd /s /q ".git\modules\%dest_dir%" 2>nul
    ) else (
        :: If it's not a submodule, just remove the directory
        rd /s /q "%dest_dir%"
    )
)

:: Ask if user wants to set up a submodule
set /p "setup_submodule=Do you want to set up this app as a Git submodule? (y/n): "

if /i "%setup_submodule%"=="y" (
    :: Ask if they have a remote URL ready
    set /p "has_remote_url=Do you have a remote Git repository URL? (y/n): "
    
    :: Create temp directory to prepare the submodule content
    if not exist "tmp" mkdir tmp
    set "temp_dir=tmp"
    echo "Copying template files to temporary directory..."
    
    xcopy /s /e /y "%src_dir%\*" "%temp_dir%\"
    
    :: Update package.json with the new app name in the temp directory
    echo "Updating package.json with new app name..."
    powershell -Command "(Get-Content '.\%temp_dir%\package.json') -replace '\"name\": \".*\"', '\"name\": \"%app_name%\"' | Set-Content '.\%temp_dir%\package.json'"
    
    if /i "%has_remote_url%"=="y" (
        :: Get Git repository URL for the new submodule
        set /p "repo_url=Enter the Git repository URL for the client submodule: "
        
        :: Create temporary directory for cloning
        set "temp_clone_dir=%temp%\temp_clone_%random%"
        mkdir "%temp_clone_dir%"
        
        :: Clone the repository
        git clone "%repo_url%" "%temp_clone_dir%" || (
            echo "Error: Failed to clone repository"
            rd /s /q "%temp_dir%" "%temp_clone_dir%"
            exit /b 1
        )
        
        :: Copy template files to the cloned repository
        xcopy /s /e /y "%temp_dir%\*" "%temp_clone_dir%\"
        
        :: Commit and push the template files
        pushd "%temp_clone_dir%"
        git add .
        git status | findstr "Changes to be committed" >nul
        if not errorlevel 1 (
            git commit -m "Initialize repository with template files"
            git push || (
                echo "Error: Failed to push to repository. Check your permissions."
                popd
                rd /s /q "%temp_dir%" "%temp_clone_dir%"
                exit /b 1
            )
        ) else (
            echo "No changes to commit. Repository may already be initialized."
        )
        popd
        
        :: Add the initialized repository as a submodule
        echo "Adding repository as a submodule..."
        git submodule add "%repo_url%" "%dest_dir%" || (
            echo "Error: Failed to add submodule. Try using --force if appropriate."
            rd /s /q "%temp_dir%" "%temp_clone_dir%"
            exit /b 1
        )
        
        :: Clean up the temp directories
        rd /s /q "%temp_dir%" "%temp_clone_dir%"
    ) else (
        :: Create a local git repository
        echo "Creating local git repository..."
        mkdir "%dest_dir%"
        
        :: Copy template files to the new directory
        xcopy /s /e /y "%temp_dir%\*" "%dest_dir%\"
        
        :: Initialize git repository
        pushd "%dest_dir%"
        git init
        git add .
        git commit -m "Initial commit with template files"
        popd
        
        :: Add the local repository as a submodule
        echo "Adding local repository as a submodule..."
        git submodule add --force ".\%dest_dir%" "%dest_dir%" 2>nul
        
        :: Clean up temp directory
        rd /s /q "%temp_dir%"
        
        echo "To add a remote URL later:
        echo "  cd %dest_dir%"
        echo "  git remote add origin [your-remote-url]"
        echo "  git push -u origin main"
    )
) else (
    :: Simple directory copy without submodule setup
    echo "Creating a regular app directory (not a submodule)..."
    xcopy /s /e /y "%src_dir%\*" "%dest_dir%\"
    
    :: Update package.json with the new app name
    echo "Updating package.json with new app name..."
    powershell -Command "(Get-Content '.\%dest_dir%\package.json') -replace '\"name\": \".*\"', '\"name\": \"%app_name%\"' | Set-Content '.\%dest_dir%\package.json'"
)

:: Commit the changes if it's a submodule
if /i "%setup_submodule%"=="y" (
    :: Commit the submodule addition
    echo "Committing the new submodule to the main repository..."
    git add .gitmodules 2>nul
    git add "%dest_dir%" 2>nul
    git commit -m "Add %app_name% project as a submodule at apps/dash" || echo "Nothing to commit. Submodule might already be tracked."
)

echo "Successfully created new app as a submodule at %dest_dir%"
echo "Instructions for clients:"
echo "======================="
echo "1. Clone the repository with: git clone --recurse-submodules [main-repo-url]"
echo "2. To work on their app:"
echo "   cd %dest_dir%"
echo "   # Make changes"
echo "   git add ."
echo "   git commit -m 'Your commit message'"
echo "   git push"
echo "3. To pull updates from the main repository:"
echo "   cd [main-repo-root]"
echo "   git pull"
echo "   git submodule update --remote"

if /i "%setup_submodule%"=="y" (
    echo "Note: Clients can only push to the %dest_dir% submodule, not to the main repository"
)

git config --local status.submodulesummary 0

endlocal