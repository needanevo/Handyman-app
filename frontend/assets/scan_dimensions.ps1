Add-Type -AssemblyName PresentationCore

$basePath = 'C:\Users\Joshua\Desktop\TheRealJohnson.com\Handyman-app-main\frontend\assets'
$files = @(
  'images/adaptive-icon.png',
  'images/app/icons/1024x1024Color.png',
  'images/app/icons/handymanBW.jpg',
  'images/app-image.png',
  'images/favicon.png',
  'images/icon.png',
  'images/logos/bw/Handyman_logo_bw.png',
  'images/logos/color/Handyman_logo_color.png',
  'images/logos/color/Handyman_logo_color@2x.png',
  'images/logos/color/Handyman_logo_color@4x.png',
  'images/logos/grayscale/Final_BW.jpg',
  'images/logos/grayscale/Handyman_logo_gray.png',
  'images/logos/variants/1024x1024Color.png',
  'images/logos/variants/Final_color.jpg',
  'images/logos/variants/Handyman_final.png',
  'images/logos/variants/Handyman_Final_BW.png',
  'images/logos/variants/Handyman_MASTERTransparent.png',
  'images/logos/variants/handymanBW.jpg',
  'images/logos/variants/HMNo_Slogan.png',
  'images/logos/variants/The_real_johnson.png',
  'images/partial-react-logo.png',
  'images/print/vector/HMNo_Slogan.png',
  'images/react-logo.png',
  'images/react-logo@2x.png',
  'images/react-logo@3x.png',
  'images/splash-image.png',
  'images/web/favicons/1024x1024Color.png',
  'images/web/favicons/Final_color.jpg',
  'images/web/headers/1024x1024Color.png'
)

foreach ($file in $files) {
  $fullPath = Join-Path $basePath $file
  if (Test-Path $fullPath) {
    try {
      $img = New-Object System.Windows.Media.Imaging.BitmapImage
      $img.BeginInit()
      $img.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
      $img.UriSource = New-Object System.Uri($fullPath)
      $img.EndInit()
      Write-Output "$file|$($img.PixelWidth)|$($img.PixelHeight)"
    } catch {
      Write-Output "$file|ERROR|$_"
    }
  } else {
    Write-Output "$file|NOTFOUND|N/A"
  }
}
