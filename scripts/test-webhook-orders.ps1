param(
  [ValidateSet("safe", "real")]
  [string]$Mode = "safe",
  [string]$Sku = "",
  [int]$Quantity = 1
)

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
  Write-Error "No se encontro .env en la raiz del proyecto."
  exit 1
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    $vars[$parts[0].Trim()] = $parts[1].Trim()
  }
}

if ($vars.ContainsKey("WEBHOOK_ORDERS_URL") -and $vars["WEBHOOK_ORDERS_URL"]) {
  $url = $vars["WEBHOOK_ORDERS_URL"]
} elseif ($vars.ContainsKey("ERP_BASE_URL") -and $vars["ERP_BASE_URL"]) {
  $url = ($vars["ERP_BASE_URL"].TrimEnd('/')) + "/api/webhooks/orders"
} else {
  Write-Error "Falta WEBHOOK_ORDERS_URL o ERP_BASE_URL en .env"
  exit 1
}

$headers = @{ "Content-Type" = "application/json" }
if ($vars.ContainsKey("WEBHOOK_MENU_SECRET") -and $vars["WEBHOOK_MENU_SECRET"]) {
  $headers["x-webhook-secret"] = $vars["WEBHOOK_MENU_SECRET"]
}

$eventId = "menu-test-" + (Get-Date -Format "yyyyMMddHHmmss")
$orderDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

if ($Mode -eq "safe") {
  $itemsToSend = @(
    @{
      sku = "SKU-QUE-NO-EXISTE"
      quantity = 1
      notes = "item de prueba"
    }
  )
  $customerName = "Test Safe"
  $note = "Prueba segura sin impacto"
} else {
  if ($Sku) {
    $itemsToSend = @(
      @{
        sku = $Sku
        quantity = $Quantity
        notes = "item de prueba"
      }
    )
  } else {
    # Combo real por defecto: La Misia + Inka Cola
    $itemsToSend = @(
      @{
        sku = "PRD-LAM-IPH3"
        quantity = 1
        notes = "La Misia de prueba"
      },
      @{
        sku = "PRD-INK-PXC0"
        quantity = 1
        notes = "Inka Cola de prueba"
      }
    )
  }
  $customerName = "Test Real"
  $note = "Prueba real de webhook (La Misia + Inka Cola)"
}

$payload = @{
  eventId = $eventId
  orderDate = $orderDate
  source = "menu-web"
  customer = @{
    name = $customerName
    phone = "+51999999999"
  }
  paymentMethod = "yape"
  notes = $note
  items = $itemsToSend
  metadata = @{
    origin = "menu-web"
    channel = "menu-web"
    testMode = $Mode
  }
}

$body = $payload | ConvertTo-Json -Depth 8

Write-Output ("URL: " + $url)
Write-Output ("MODE: " + $Mode)
Write-Output ("EVENT_ID: " + $eventId)
Write-Output ("ITEMS: " + (($itemsToSend | ForEach-Object { $_.sku + " x" + $_.quantity }) -join ", "))

try {
  $resp = Invoke-WebRequest -Method Post -Uri $url -Headers $headers -Body $body -TimeoutSec 20
  Write-Output ("STATUS: " + [int]$resp.StatusCode)
  Write-Output "BODY:"
  Write-Output $resp.Content
  exit 0
} catch {
  $response = $_.Exception.Response
  if ($null -ne $response) {
    $status = [int]$response.StatusCode
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $content = $reader.ReadToEnd()
    $reader.Close()
    Write-Output ("STATUS: " + $status)
    Write-Output "BODY:"
    Write-Output $content
    exit 1
  }

  Write-Error $_.Exception.Message
  exit 1
}
