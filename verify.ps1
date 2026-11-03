param (
    [Parameter(Mandatory=$false, HelpMessage="Base URL e.g. https://fonts.alwadih.org/quran/fonts/v2")]
    [string]$BaseUrl = "https://fonts.alwadih.org/quran/fonts/v2"
)

$BaseUrl = $BaseUrl.TrimEnd('/')
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Report-Pass($msg) {
    param($msg)
    $script:TotalTests++
    $script:PassedTests++
    Write-Host " [PASS] $msg" -ForegroundColor Green
}

function Report-Fail($msg) {
    param($msg)
    $script:TotalTests++
    $script:FailedTests++
    Write-Host " [FAIL] $msg" -ForegroundColor Red
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Quran Fonts V2 - Production Verification Suite" -ForegroundColor Cyan
Write-Host " Target URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Manifest
Write-Host "`n[1/4] Verifying manifest.json..." -ForegroundColor Yellow
$manifestUrl = "$BaseUrl/manifest.json"
try {
    $manifestRes = Invoke-WebRequest -Uri $manifestUrl -Method Get -UseBasicParsing -TimeoutSec 30
    if ($manifestRes.StatusCode -eq 200) {
        Report-Pass "manifest.json returned HTTP 200"
    } else {
        Report-Fail "manifest.json returned status $($manifestRes.StatusCode)"
    }

    $ct = $manifestRes.Headers["Content-Type"]
    if ($ct -and $ct.ToLower().Contains("application/json")) {
        Report-Pass "manifest.json Content-Type is application/json ($ct)"
    } else {
        Report-Fail "manifest.json Content-Type is '$ct' (expected application/json)"
    }

    $cc = $manifestRes.Headers["Cache-Control"]
    if ($cc -and $cc.ToLower().Contains("max-age=3600")) {
        Report-Pass "manifest.json Cache-Control includes max-age=3600 ($cc)"
    } else {
        Report-Fail "manifest.json Cache-Control is '$cc' (expected public, max-age=3600)"
    }

    $manifestJson = $manifestRes.Content | ConvertFrom-Json
    $entryCount = 0
    if ($manifestJson.files) {
        $entryCount = ($manifestJson.files | Get-Member -MemberType NoteProperty).Count
    } elseif ($manifestJson.count) {
        $entryCount = [int]$manifestJson.count
    } elseif ($manifestJson -is [System.Array]) {
        $entryCount = $manifestJson.Count
    } else {
        $entryCount = ($manifestJson | Get-Member -MemberType NoteProperty).Count
    }

    if ($entryCount -eq 604) {
        Report-Pass "manifest.json contains exactly 604 font entries (count: $entryCount)"
    } else {
        Report-Fail "manifest.json contains $entryCount entries (expected 604)"
    }
} catch {
    Report-Fail "Failed to fetch manifest.json: $_"
}

# 2. SHA-256 p587.ttf
Write-Host "`n[2/4] Verifying SHA-256 of p587.ttf..." -ForegroundColor Yellow
$p587Url = "$BaseUrl/p587.ttf"
$expectedHash = "5fcb3b47363dc46bb3442cb0e2fad2154cb450d413fdd6f6870fb7ca8562fc1d"

try {
    $p587Res = Invoke-WebRequest -Uri $p587Url -Method Get -UseBasicParsing -TimeoutSec 30
    $hasher = [System.Security.Cryptography.SHA256]::Create()
    $actualHash = -join ($hasher.ComputeHash($p587Res.Content) | ForEach-Object { "{0:x2}" -f $_ })

    if ($actualHash.ToLower() -eq $expectedHash.ToLower()) {
        Report-Pass "p587.ttf SHA-256 match: $actualHash"
    } else {
        Report-Fail "p587.ttf SHA-256 mismatch! Got: $actualHash, Expected: $expectedHash"
    }
} catch {
    Report-Fail "Failed to download p587.ttf: $_"
}

# 3. All 604 font files
Write-Host "`n[3/4] Verifying all 604 font files (p1.ttf to p604.ttf)..." -ForegroundColor Yellow
$failedFonts = @()
$headerFailures = @()

for ($i = 1; $i -le 604; $i++) {
    $fontName = "p$i.ttf"
    $fontUrl = "$BaseUrl/$fontName"

    if ($i % 100 -eq 1 -or $i -eq 1 -or $i -eq 604) {
        Write-Host " Checking $fontName ($i/604)..." -ForegroundColor Gray
    }

    $success = $false
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $headRes = Invoke-WebRequest -Uri $fontUrl -Method Head -UseBasicParsing -TimeoutSec 15
            if ($headRes.StatusCode -eq 200) {
                $ct = $headRes.Headers["Content-Type"]
                $cc = $headRes.Headers["Cache-Control"]

                $ctValid = $ct -and $ct.ToLower().Contains("font/ttf")
                $ccValid = $cc -and $cc.ToLower().Contains("31536000") -and $cc.ToLower().Contains("immutable")

                if (-not $ctValid -or -not $ccValid) {
                    $headerFailures += "$fontName (Content-Type: '$ct', Cache-Control: '$cc')"
                }
                $success = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 150
        }
    }
    if (-not $success) {
        $failedFonts += $fontName
    }
}

if ($failedFonts.Count -eq 0) {
    Report-Pass "All 604 font files returned HTTP 200"
} else {
    Report-Fail "$($failedFonts.Count) font files failed: $($failedFonts[0..4] -join ', ')..."
}

if ($headerFailures.Count -eq 0) {
    Report-Pass "All 604 font files have Content-Type: font/ttf and Cache-Control: public, max-age=31536000, immutable"
} else {
    Report-Fail "$($headerFailures.Count) font files had incorrect headers: $($headerFailures[0..4] -join ', ')..."
}

# 4. Missing file 404
Write-Host "`n[4/4] Verifying missing file returns plain 404 (not HTML)..." -ForegroundColor Yellow
$missingUrl = "$BaseUrl/p999.ttf"

try {
    $res404 = $null
    try {
        $res404 = Invoke-WebRequest -Uri $missingUrl -Method Get -UseBasicParsing -TimeoutSec 15 -SkipHttpErrorCheck
    } catch [System.Net.WebException] {
        $res404 = $_.Exception.Response
    }

    $statusCode = 0
    $contentType = ""
    $contentBody = ""

    if ($res404.StatusCode) {
        $statusCode = [int]$res404.StatusCode
        $contentType = $res404.Headers["Content-Type"]
        $contentBody = $res404.Content
    } elseif ($res404.StatusCode.value__) {
        $statusCode = $res404.StatusCode.value__
        $contentType = $res404.Headers["Content-Type"]
        $reader = New-Object System.IO.StreamReader($res404.GetResponseStream())
        $contentBody = $reader.ReadToEnd()
    }

    if ($statusCode -eq 404) {
        Report-Pass "Missing file returned HTTP 404"
    } else {
        Report-Fail "Missing file returned status $statusCode (expected 404)"
    }

    if ($contentType -and $contentType.ToLower().Contains("text/plain")) {
        Report-Pass "Missing file Content-Type is text/plain ($contentType)"
    } else {
        Report-Fail "Missing file Content-Type is '$contentType' (expected text/plain)"
    }

    $isHtml = ($contentBody -match "<html" -or $contentBody -match "<!DOCTYPE" -or $contentBody -match "<head")
    if (-not $isHtml) {
        Report-Pass "Missing file response does NOT contain HTML (plain text verified)"
    } else {
        Report-Fail "Missing file returned an HTML error page instead of plain text!"
    }
} catch {
    Report-Fail "Error testing 404 behavior: $_"
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Verification Summary: $PassedTests Passed, $FailedTests Failed (Total: $TotalTests)" -ForegroundColor $(if ($FailedTests -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan
