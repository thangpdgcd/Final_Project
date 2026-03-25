Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Join-Path $PSScriptRoot ".."
$outRoot = Join-Path $root "cursor-assets"

$palette = @{
  darkBrown = [System.Drawing.Color]::FromArgb(255, 59, 36, 23)
  mocha     = [System.Drawing.Color]::FromArgb(255, 107, 74, 58)
  caramel   = [System.Drawing.Color]::FromArgb(255, 183, 119, 60)
  cream     = [System.Drawing.Color]::FromArgb(255, 243, 230, 214)
}

function New-Canvas {
  param([int]$size)
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  return @{ bmp = $bmp; g = $g }
}

function Save-Asset {
  param(
    [string]$concept,
    [string]$state,
    [int]$size,
    [scriptblock]$drawFn
  )
  $dir = Join-Path $outRoot $concept
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $canvas = New-Canvas -size $size
  & $drawFn $canvas.g $size
  $file = Join-Path $dir "$concept-$state-$size.png"
  $canvas.bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.g.Dispose()
  $canvas.bmp.Dispose()
}

function Draw-SoftShadow {
  param($g, [int]$x, [int]$y, [int]$w, [int]$h, [int]$a = 40)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($a, 35, 22, 16))
  $g.FillEllipse($brush, $x, $y, $w, $h)
  $brush.Dispose()
}

function Draw-CoffeeBean {
  param($g, [int]$size, [string]$state)
  $scale = $size / 64.0
  Draw-SoftShadow $g (14 * $scale) (40 * $scale) (34 * $scale) (12 * $scale) 32
  $beanBrush = New-Object System.Drawing.SolidBrush($palette.darkBrown)
  $accentBrush = New-Object System.Drawing.SolidBrush($palette.mocha)
  $highlightPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(210, $palette.caramel), [Math]::Max(1, 2 * $scale))
  $crackPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 90, 57, 39), [Math]::Max(1, 2.2 * $scale))

  if ($state -eq "hover") {
    $handBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 217, 180, 149))
    $g.FillEllipse($handBrush, 10 * $scale, 28 * $scale, 22 * $scale, 18 * $scale)
    $g.FillEllipse($handBrush, 20 * $scale, 30 * $scale, 24 * $scale, 17 * $scale)
    $g.FillEllipse($handBrush, 34 * $scale, 27 * $scale, 10 * $scale, 16 * $scale)
    $handBrush.Dispose()
  }

  $g.TranslateTransform(30 * $scale, 30 * $scale)
  $g.RotateTransform(-35)
  $beanW = if ($state -eq "active") { 26 * $scale } else { 28 * $scale }
  $beanH = if ($state -eq "active") { 38 * $scale } else { 40 * $scale }
  $g.FillEllipse($beanBrush, -$beanW / 2, -$beanH / 2, $beanW, $beanH)
  $g.FillEllipse($accentBrush, -$beanW / 4, -$beanH / 3, $beanW / 2, $beanH / 1.7)
  $g.DrawBezier($crackPen, -3 * $scale, -14 * $scale, 6 * $scale, -8 * $scale, -8 * $scale, 7 * $scale, 1 * $scale, 15 * $scale)
  $g.DrawArc($highlightPen, -$beanW / 2 + 2 * $scale, -$beanH / 2 + 1 * $scale, $beanW - 4 * $scale, $beanH / 2, 215, 80)
  $g.ResetTransform()

  $tipBrush = New-Object System.Drawing.SolidBrush($palette.darkBrown)
  $tipPts = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(44 * $scale, 44 * $scale),
    [System.Drawing.PointF]::new(53 * $scale, 40 * $scale),
    [System.Drawing.PointF]::new(48 * $scale, 50 * $scale)
  )
  $g.FillPolygon($tipBrush, $tipPts)

  $beanBrush.Dispose(); $accentBrush.Dispose(); $highlightPen.Dispose(); $crackPen.Dispose(); $tipBrush.Dispose()
}

function Draw-EspressoCup {
  param($g, [int]$size, [string]$state)
  $scale = $size / 64.0
  Draw-SoftShadow $g (13 * $scale) (41 * $scale) (36 * $scale) (10 * $scale) 30
  $cupBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 236, 224))
  $rimPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 214, 196, 175), [Math]::Max(1, 2 * $scale))
  $cremaBrush = New-Object System.Drawing.SolidBrush($palette.caramel)
  $steamPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, $palette.cream), [Math]::Max(1, 2.4 * $scale))
  $steamPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $steamPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $g.FillEllipse($cupBrush, 14 * $scale, 24 * $scale, 36 * $scale, 28 * $scale)
  $g.DrawEllipse($rimPen, 14 * $scale, 24 * $scale, 36 * $scale, 28 * $scale)
  $g.FillEllipse($cremaBrush, 19 * $scale, 29 * $scale, 26 * $scale, 18 * $scale)

  if ($state -eq "hover") {
    $heartBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, $palette.cream))
    $g.FillEllipse($heartBrush, 24 * $scale, 10 * $scale, 7 * $scale, 7 * $scale)
    $g.FillEllipse($heartBrush, 30 * $scale, 10 * $scale, 7 * $scale, 7 * $scale)
    $heartPts = [System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(23.5 * $scale, 14 * $scale),
      [System.Drawing.PointF]::new(33.5 * $scale, 24 * $scale),
      [System.Drawing.PointF]::new(43.5 * $scale, 14 * $scale)
    )
    $g.FillPolygon($heartBrush, $heartPts)
    $heartBrush.Dispose()
  } else {
    $g.DrawBezier($steamPen, 24 * $scale, 24 * $scale, 16 * $scale, 14 * $scale, 34 * $scale, 12 * $scale, 42 * $scale, 8 * $scale)
  }

  if ($state -eq "active") {
    $g.DrawBezier($steamPen, 27 * $scale, 24 * $scale, 35 * $scale, 18 * $scale, 30 * $scale, 12 * $scale, 44 * $scale, 10 * $scale)
  }

  $tipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, $palette.cream))
  $tipPts = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(42 * $scale, 8 * $scale),
    [System.Drawing.PointF]::new(51 * $scale, 6 * $scale),
    [System.Drawing.PointF]::new(46 * $scale, 14 * $scale)
  )
  $g.FillPolygon($tipBrush, $tipPts)

  $cupBrush.Dispose(); $rimPen.Dispose(); $cremaBrush.Dispose(); $steamPen.Dispose(); $tipBrush.Dispose()
}

function Draw-CoffeeSpoon {
  param($g, [int]$size, [string]$state)
  $scale = $size / 64.0
  Draw-SoftShadow $g (12 * $scale) (42 * $scale) (38 * $scale) (9 * $scale) 30
  $metalPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 208, 210, 214), [Math]::Max(1, 3.5 * $scale))
  $metalPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $metalPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $handlePen = New-Object System.Drawing.Pen($palette.darkBrown, [Math]::Max(1, 3.3 * $scale))
  $bowlBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 221, 224, 228))

  $g.DrawLine($handlePen, 16 * $scale, 44 * $scale, 38 * $scale, 24 * $scale)
  $g.DrawLine($metalPen, 38 * $scale, 24 * $scale, 50 * $scale, 13 * $scale)
  $g.FillEllipse($bowlBrush, 45 * $scale, 8 * $scale, 12 * $scale, 12 * $scale)

  if ($state -eq "hover") {
    $milkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 250, 248, 244))
    $g.FillEllipse($milkBrush, 48 * $scale, 10 * $scale, 6 * $scale, 8 * $scale)
    $milkBrush.Dispose()
  }

  if ($state -eq "active") {
    $dropBrush = New-Object System.Drawing.SolidBrush($palette.cream)
    $dropPts = [System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(53 * $scale, 20 * $scale),
      [System.Drawing.PointF]::new(57 * $scale, 27 * $scale),
      [System.Drawing.PointF]::new(50 * $scale, 27 * $scale)
    )
    $g.FillPolygon($dropBrush, $dropPts)
    $dropBrush.Dispose()
  }

  $tipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 232, 235))
  $tipPts = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(56 * $scale, 10 * $scale),
    [System.Drawing.PointF]::new(62 * $scale, 8 * $scale),
    [System.Drawing.PointF]::new(59 * $scale, 14 * $scale)
  )
  $g.FillPolygon($tipBrush, $tipPts)

  $metalPen.Dispose(); $handlePen.Dispose(); $bowlBrush.Dispose(); $tipBrush.Dispose()
}

function Draw-CoffeeDrop {
  param($g, [int]$size, [string]$state)
  $scale = $size / 64.0
  Draw-SoftShadow $g (16 * $scale) (42 * $scale) (28 * $scale) (9 * $scale) 32
  $dropBrush = New-Object System.Drawing.SolidBrush($palette.mocha)
  $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, $palette.cream))

  $main = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(31 * $scale, 8 * $scale),
    [System.Drawing.PointF]::new(47 * $scale, 28 * $scale),
    [System.Drawing.PointF]::new(31 * $scale, 52 * $scale),
    [System.Drawing.PointF]::new(15 * $scale, 28 * $scale)
  )
  $g.FillPolygon($dropBrush, $main)
  $g.FillEllipse($highlightBrush, 23 * $scale, 17 * $scale, 10 * $scale, 8 * $scale)

  if ($state -eq "hover") {
    $miniBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 94, 66, 52))
    $g.FillEllipse($miniBrush, 45 * $scale, 23 * $scale, 6 * $scale, 6 * $scale)
    $g.FillEllipse($miniBrush, 50 * $scale, 30 * $scale, 5 * $scale, 5 * $scale)
    $g.FillEllipse($miniBrush, 40 * $scale, 33 * $scale, 5 * $scale, 5 * $scale)
    $miniBrush.Dispose()
  }

  if ($state -eq "active") {
    $impactBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, $palette.caramel))
    $g.FillEllipse($impactBrush, 22 * $scale, 32 * $scale, 18 * $scale, 10 * $scale)
    $impactBrush.Dispose()
  }

  $tipBrush = New-Object System.Drawing.SolidBrush($palette.darkBrown)
  $tipPts = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(31 * $scale, 7 * $scale),
    [System.Drawing.PointF]::new(35 * $scale, 2 * $scale),
    [System.Drawing.PointF]::new(27 * $scale, 2 * $scale)
  )
  $g.FillPolygon($tipBrush, $tipPts)

  $dropBrush.Dispose(); $highlightBrush.Dispose(); $tipBrush.Dispose()
}

$concepts = @("coffee-bean", "espresso-cup", "coffee-spoon", "coffee-drop")

$states = @("default", "hover", "active")
$sizes = @(64, 32)

foreach ($concept in $concepts) {
  foreach ($state in $states) {
    foreach ($size in $sizes) {
      Save-Asset -concept $concept -state $state -size $size -drawFn {
        param($g, $s)
        if ($concept -eq "coffee-bean") { Draw-CoffeeBean $g $s $state }
        elseif ($concept -eq "espresso-cup") { Draw-EspressoCup $g $s $state }
        elseif ($concept -eq "coffee-spoon") { Draw-CoffeeSpoon $g $s $state }
        else { Draw-CoffeeDrop $g $s $state }
      }
    }
  }
}

Write-Host "Generated premium coffee cursor set in $outRoot"
