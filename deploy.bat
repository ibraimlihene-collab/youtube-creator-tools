@echo off
REM deploy.bat

REM Build the project
echo Building the project...
npm run build

REM Check if build was successful
if %errorlevel% == 0 (
    echo Build successful!
    
    REM Deploy to Netlify using drag and drop method
    echo To deploy to Netlify:
    echo 1. Go to https://app.netlify.com
    echo 2. Sign in or create an account
    echo 3. Click 'Add new site' and select 'Deploy manually'
    echo 4. Drag and drop the 'dist' folder to the deployment area
    echo.
    echo Alternatively, if you have the Netlify CLI installed:
    echo netlify deploy --prod
) else (
    echo Build failed. Please check the errors above.
)