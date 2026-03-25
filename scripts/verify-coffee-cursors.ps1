Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$root = Join-Path $PSScriptRoot ".."
$files = Get-ChildItem -Path (Join-Path $root "cursor-assets") -Recurse -Filter *.png
Write-Host ("count=" + $files.Count)

foreach ($f in $files) {
  $img = [System.Drawing.Bitmap]::FromFile($f.FullName)
  $hasAlpha = $false
  for ($x = 0; $x -lt $img.Width -and -not $hasAlpha; $x++) {
    for ($y = 0; $y -lt $img.Height; $y++) {
      if ($img.GetPixel($x, $y).A -lt 255) {
        $hasAlpha = $true
        break
      }
    }
  }

  $rel = $f.FullName.Replace((Resolve-Path $root).Path + "\", "")
  Write-Host ("{0}|{1}x{2}|alpha={3}" -f $rel, $img.Width, $img.Height, $hasAlpha)
  $img.Dispose()
}
