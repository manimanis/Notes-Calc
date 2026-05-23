Add-Type -AssemblyName System.Drawing

function Save-Icon {
  param([int]$Size, [string]$Path)
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($Size, $Size),
    [System.Drawing.Color]::FromArgb(49, 46, 129),
    [System.Drawing.Color]::FromArgb(79, 70, 229))
  $g.FillRectangle($brush, 0, 0, $Size, $Size)
  $font = New-Object System.Drawing.Font('Segoe UI', [int]($Size * 0.22), [System.Drawing.FontStyle]::Bold)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = 'Center'
  $sf.LineAlignment = 'Center'
  $rect1 = New-Object System.Drawing.RectangleF(0, ($Size * 0.08), $Size, ($Size * 0.55))
  $rect2 = New-Object System.Drawing.RectangleF(0, ($Size * 0.52), $Size, ($Size * 0.25))
  $g.DrawString('20', $font, [System.Drawing.Brushes]::White, $rect1, $sf)
  $font2 = New-Object System.Drawing.Font('Segoe UI', [int]($Size * 0.08), [System.Drawing.FontStyle]::Regular)
  $g.DrawString('/20', $font2, [System.Drawing.Brushes]::White, $rect2, $sf)
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$dir = Join-Path $PSScriptRoot '..\images'
Save-Icon -Size 180 -Path (Join-Path $dir 'icon-180.png')
Save-Icon -Size 192 -Path (Join-Path $dir 'icon-192.png')
Save-Icon -Size 512 -Path (Join-Path $dir 'icon-512.png')
Write-Output 'Icons generated.'
