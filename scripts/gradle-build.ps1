param([Parameter(Mandatory=$true)][string]$ProjectRoot, [Parameter(Mandatory=$true)][string]$GradleCache)
$ErrorActionPreference = 'Stop'
$cacheRoot = [IO.Path]::GetFullPath((Join-Path $GradleCache 'caches'))
$logPath = Join-Path $ProjectRoot 'artifacts\android-build.log'
New-Item -ItemType Directory -Force (Split-Path -Parent $logPath) | Out-Null

# Some Windows JVMs keep transformed JAR handles open until Gradle exits.
# Recover only completed, project-local temporary cache entries after exit.
for ($attempt = 1; $attempt -le 8; $attempt++) {
    if (Test-Path -LiteralPath $cacheRoot) {
        foreach ($version in Get-ChildItem -LiteralPath $cacheRoot -Directory) {
            if ($version.Name -notmatch '^\d+\.\d+(\.\d+)?$') { continue }
            foreach ($kind in @('groovy-dsl', 'transforms', 'kotlin-dsl')) {
                $parent = Join-Path $version.FullName $kind
                if (-not (Test-Path -LiteralPath $parent)) { continue }
                foreach ($folder in Get-ChildItem -LiteralPath $parent -Directory) {
                    if ($folder.Name -notmatch '^([a-f0-9]{32})-[a-f0-9-]{36}$') { continue }
                    $destination = Join-Path $parent $Matches[1]
                    if (-not $folder.FullName.StartsWith($cacheRoot + '\') -or -not $destination.StartsWith($cacheRoot + '\')) { throw 'Unexpected cache location' }
                    if (-not (Test-Path -LiteralPath $destination) -and (Test-Path -LiteralPath (Join-Path $folder.FullName 'metadata.bin'))) {
                        Move-Item -LiteralPath $folder.FullName -Destination $destination
                    }
                }
            }
        }
    }
    $ErrorActionPreference = 'Continue'
    & .\gradlew.bat assembleDebug --no-daemon --console=plain '-Dorg.gradle.vfs.watch=false' '-Dorg.gradle.internal.instrumentation.agent=false' 2>&1 | Tee-Object -FilePath $logPath
    $buildExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($buildExit -eq 0) { return }
    if ((Get-Content -LiteralPath $logPath -Raw) -notmatch 'Could not move temporary workspace') { throw "Android build failed. See $logPath" }
    Write-Host "Retrying Windows Gradle cache lock (attempt $attempt/8)."
}
throw "Windows Gradle cache recovery exhausted. See $logPath"
