param(
  [int]$Attempts = 1,
  [string]$WebhookUrl,
  [string]$WebhookSecret,
  [string]$MenuFile = "app/data/menuData.js",
  [int]$TimeoutSec = 30
)

if ($Attempts -lt 1) {
  Write-Error "Attempts debe ser mayor o igual a 1."
  exit 1
}

if ($TimeoutSec -lt 1) {
  Write-Error "TimeoutSec debe ser mayor o igual a 1."
  exit 1
}

$ErrorActionPreference = "Stop"


function Get-WebhookUrl {
  param([string]$ExplicitUrl)

  if ($ExplicitUrl) { return $ExplicitUrl }
  if ($env:WEBHOOK_ORDERS_URL) { return $env:WEBHOOK_ORDERS_URL }

  $baseUrl = if ($env:ERP_BASE_URL) { $env:ERP_BASE_URL } else { "https://bigjack-rp.vercel.app" }
  return ($baseUrl.TrimEnd("/")) + "/api/webhooks/orders"
}

function Get-WebhookSecret {
  param([string]$ExplicitSecret)

  if ($ExplicitSecret) { return $ExplicitSecret }

  foreach ($name in @("WEBHOOK_MENU_SECRET", "WEBHOOK_SECRET", "ERP_WEBHOOK_SECRET")) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value
    }
  }

  return ""
}

function Get-BraceDelta {
  param([string]$Line)

  $openCount = ([regex]::Matches($Line, "\\{")).Count
  $closeCount = ([regex]::Matches($Line, "\\}")).Count
  return $openCount - $closeCount
}

function Get-ActiveMenuSkus {
  param([string]$RelativeMenuPath)

  $menuPath = Join-Path (Get-Location) $RelativeMenuPath
  if (-not (Test-Path $menuPath)) {
    throw "No se encontro el archivo de menu en: $menuPath"
  }

  $lines = Get-Content -Path $menuPath
  $insideMenuItems = $false
  $insideItem = $false
  $depth = 0
  $itemLines = [System.Collections.Generic.List[string]]::new()
  $result = [System.Collections.Generic.List[string]]::new()

  foreach ($line in $lines) {
    if (-not $insideMenuItems) {
      if ($line -match "^\s*export\s+const\s+menuItems\s*=\s*\[") {
        $insideMenuItems = $true
      }
      continue
    }

    if ($insideMenuItems -and -not $insideItem) {
      if ($line -match "^\s*\]\s*;\s*$") {
        break
      }

      if ($line -match "^\s*\{\s*$") {
        $insideItem = $true
        $depth = 0
        $itemLines.Clear()
      } else {
        continue
      }
    }

    if ($insideItem) {
      $itemLines.Add($line)
      $depth += Get-BraceDelta -Line $line

      if ($depth -eq 0) {
        $block = ($itemLines -join "`n")
        $insideItem = $false

        if ($block -match '\bavailable\s*:\s*false\b') {
          continue
        }

        $matches = [regex]::Matches($block, '\bsku\s*:\s*"([^"]+)"')
        foreach ($match in $matches) {
          $sku = $match.Groups[1].Value.Trim()
          if (-not [string]::IsNullOrWhiteSpace($sku)) {
            $result.Add($sku)
          }
        }
      }
    }
  }

  $unique = $result | Select-Object -Unique
  if (-not $unique -or $unique.Count -lt 2) {
    throw "No hay suficientes SKUs activos en $RelativeMenuPath para ejecutar pruebas (se requieren al menos 2)."
  }

  return $unique
}

function Normalize-PaymentMethod {
  param([string]$PaymentMethod)

  $value = [string]($PaymentMethod)
  $value = $value.Trim().ToLowerInvariant()

  if ($value -eq "cash") { return "efectivo" }
  if ($value -eq "card") { return "tarjeta" }
  if ([string]::IsNullOrWhiteSpace($value)) { return "efectivo" }

  return $value
}

function New-MenuEventId {
  $date = (Get-Date).ToUniversalTime().ToString("yyyyMMdd")
  $nonce = -join ((48..57 + 97..122) | Get-Random -Count 6 | ForEach-Object { [char]$_ })
  return "menu-$date-$nonce"
}

function New-OrderPayload {
  param(
    [string]$EventId,
    [array]$Items,
    [string]$ExpectedHint
  )

  $orderType = "pickup"
  $pickupTime = "now"
  $scheduledTime = ""
  $locationLink = ""
  $deliveryAddress = ""

  return @{
    eventId = $EventId
    orderDate = (Get-Date).ToUniversalTime().ToString("o")
    source = "menu-web"
    customer = @{
      name = "Cliente online"
      phone = "+51999999999"
    }
    paymentMethod = Normalize-PaymentMethod -PaymentMethod "yape"
    notes = "Prueba local webhook"
    items = $Items
    metadata = @{
      origin = "menu-web"
      channel = "menu-web"
      orderType = $orderType
      pickupTime = $pickupTime
      scheduledTime = if ($scheduledTime) { $scheduledTime } else { $null }
      isPreOrder = $false
      locationLink = if ($locationLink) { $locationLink } else { $null }
      deliveryAddress = if ($orderType -eq "delivery" -and $deliveryAddress) { $deliveryAddress } else { $null }
      testMode = "local-script"
      expected = $ExpectedHint
    }
  }
}

$WebhookUrl = Get-WebhookUrl -ExplicitUrl $WebhookUrl
$WebhookSecret = Get-WebhookSecret -ExplicitSecret $WebhookSecret
$CatalogSkus = Get-ActiveMenuSkus -RelativeMenuPath $MenuFile

function Invoke-WebhookTest {
  param(
    [string]$Title,
    [string]$EventId,
    [array]$Items,
    [string]$Secret,
    [string]$ExpectedHint
  )

  $headers = @{ "Content-Type" = "application/json" }
  if (-not [string]::IsNullOrWhiteSpace($Secret)) {
    $headers["x-webhook-secret"] = $Secret
  }

  $payload = New-OrderPayload -EventId $EventId -Items $Items -ExpectedHint $ExpectedHint

  $body = $payload | ConvertTo-Json -Depth 10

  Write-Host ""
  Write-Host ("===== " + $Title + " =====")
  Write-Host ("URL: " + $WebhookUrl)
  Write-Host ("EVENT_ID: " + $EventId)
  Write-Host ("EXPECT: " + $ExpectedHint)
  Write-Host ("ITEMS: " + (($Items | ForEach-Object { $_.sku + " x" + $_.quantity }) -join ", "))

  try {
    $resp = Invoke-WebRequest -Method Post -Uri $WebhookUrl -Headers $headers -Body $body -TimeoutSec $TimeoutSec
    Write-Host ("STATUS: " + [int]$resp.StatusCode)
    Write-Host "BODY:"
    Write-Host $resp.Content
    return [PSCustomObject]@{ Status = [int]$resp.StatusCode; Body = $resp.Content }
  }
  catch {
    $response = $_.Exception.Response
    if ($null -ne $response) {
      $status = [int]$response.StatusCode
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $content = $reader.ReadToEnd()
      $reader.Close()
      Write-Host ("STATUS: " + $status)
      Write-Host "BODY:"
      Write-Host $content
      return [PSCustomObject]@{ Status = $status; Body = $content }
    }
    Write-Host "STATUS: 0"
    Write-Host "BODY:"
    Write-Host $_.Exception.Message
    return [PSCustomObject]@{ Status = 0; Body = $_.Exception.Message }
  }
}

Write-Output "=== TEST WEBHOOK LOCAL (ALINEADO A ONLINE ORDERS) ==="
Write-Output ("Attempts: " + $Attempts)
Write-Output ("Webhook URL: " + $WebhookUrl)
Write-Output ("Secret detectado/env: " + ($(if ($WebhookSecret) { "SI" } else { "NO" })))
Write-Output ("Menu source: " + $MenuFile)
Write-Output ""
Write-Output "SKUs activos detectados en menuData.js:"
$CatalogSkus | ForEach-Object { Write-Output ("- " + $_) }

$exitCode = 0

for ($i = 1; $i -le $Attempts; $i++) {
  $baseEvent = (New-MenuEventId) + "-$i"
  $validSkuA = $CatalogSkus[0]
  $validSkuB = $CatalogSkus[1]

  # Caso 1: pedido valido (debe crear venta)
  $validItems = @(
    @{ sku = $validSkuA; quantity = 1; notes = "Item A" },
    @{ sku = $validSkuB; quantity = 1; notes = "Item B" }
  )
  $res1 = Invoke-WebhookTest -Title "CASO 1 - VALIDO" -EventId $baseEvent -Items $validItems -Secret $WebhookSecret -ExpectedHint "200 success=true"
  if ($res1.Status -ne 200) { $exitCode = 1 }

  # Caso 2: idempotencia (mismo eventId que caso 1)
  $res2 = Invoke-WebhookTest -Title "CASO 2 - DUPLICADO IDEMPOTENTE" -EventId $baseEvent -Items $validItems -Secret $WebhookSecret -ExpectedHint "200 duplicated=true"
  if ($res2.Status -ne 200) { $exitCode = 1 }

  # Caso 3: secret invalido
  $res3 = Invoke-WebhookTest -Title "CASO 3 - SECRET INVALIDO" -EventId ($baseEvent + "-badsecret") -Items $validItems -Secret "SECRET_INVALIDO" -ExpectedHint "401 No autorizado"
  if ($res3.Status -ne 401) { $exitCode = 1 }

  # Caso 4: SKU inexistente
  $badSkuItems = @(
    @{ sku = "SKU-NO-EXISTE-999"; quantity = 1; notes = "Debe fallar" }
  )
  $res4 = Invoke-WebhookTest -Title "CASO 4 - SKU INEXISTENTE" -EventId ($baseEvent + "-badsku") -Items $badSkuItems -Secret $WebhookSecret -ExpectedHint "400 missingSkus"
  if ($res4.Status -ne 400) { $exitCode = 1 }

  Write-Output ""
  Write-Output ("--- FIN BLOQUE DE PRUEBAS " + $i + " DE " + $Attempts + " ---")
  Write-Output ""
}

Write-Output "=== RESULTADO FINAL ==="
if ($exitCode -eq 0) {
  Write-Output "OK: Los status devueltos coinciden con lo esperado en los 4 casos."
} else {
  Write-Output "ERROR: Uno o mas casos no devolvieron el status esperado. Revisa STATUS/BODY arriba."
}

exit $exitCode
