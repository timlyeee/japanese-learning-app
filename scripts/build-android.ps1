param([string]$SdkPath, [string]$JavaPath)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

if (-not $SdkPath) {
    $SdkPath = @($env:ANDROID_HOME, 'D:\SDK\Android', "$projectRoot\.tools\android-sdk") | Where-Object { $_ -and (Test-Path -LiteralPath "$_\platforms") } | Select-Object -First 1
}
if (-not $JavaPath) {
    $JavaPath = @('D:\SDK\JavaSE_21', 'D:\SDK\Java\jdk21.0.13_0', "$projectRoot\.tools\java\jdk21.0.13_0", $env:JAVA_HOME) | Where-Object { $_ -and (Test-Path -LiteralPath "$_\bin\java.exe") } | Select-Object -First 1
}
if (-not $SdkPath -or -not $JavaPath) { throw 'Android SDK and Java 21 are required. Pass -SdkPath and -JavaPath.' }
$env:ANDROID_HOME = $SdkPath
$env:JAVA_HOME = $JavaPath
$env:GRADLE_USER_HOME = "$projectRoot\.tools\gradle-cache"
"sdk.dir=$($SdkPath.Replace('\', '/'))" | Set-Content -LiteralPath android/local.properties -Encoding ascii

npm run build
if ($LASTEXITCODE -ne 0) { throw 'Web build failed' }
npx cap sync android
if ($LASTEXITCODE -ne 0) { throw 'Android sync failed' }
Push-Location android
try {
    & "$PSScriptRoot\gradle-build.ps1" -ProjectRoot $projectRoot -GradleCache $env:GRADLE_USER_HOME
} finally { Pop-Location }
New-Item -ItemType Directory -Force artifacts | Out-Null
Copy-Item -LiteralPath android/app/build/outputs/apk/debug/app-debug.apk -Destination artifacts/learnnew-android.apk
node --input-type=module -e "import fs from 'node:fs'; import crypto from 'node:crypto'; console.log('SHA256: ' + crypto.createHash('sha256').update(fs.readFileSync('artifacts/learnnew-android.apk')).digest('hex'));"
Write-Host "APK: $projectRoot\artifacts\learnnew-android.apk"
