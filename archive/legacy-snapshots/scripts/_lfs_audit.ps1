$ErrorActionPreference = 'Stop'
$lfsExts = @(
  '.pdf','.ppt','.pptx','.pptm','.doc','.docx','.xlsm','.odp','.odt','.ods',
  '.mp4','.mov','.avi','.mkv','.webm','.m4a','.mp3','.wav','.flac',
  '.zip','.rar','.tar','.gz','.tgz','.bz2',
  '.psd','.ai','.fig','.sketch','.key','.xcf','.indd',
  '.slx','.slxc','.mlx',
  '.sldprt','.sldasm','.slddrw','.step','.stp','.iges','.igs','.stl','.f3d','.3mf','.obj',
  '.h5','.hdf5','.pkl','.npy','.npz','.parquet','.onnx','.safetensors','.pt','.pth','.ckpt',
  '.ttf','.otf','.woff','.woff2',
  '.psb','.tif','.tiff'
)
# include 7z separately so PowerShell doesn't parse .7z as member access
$lfsExts += '.7z'

$untracked = git ls-files --others --exclude-standard

$lfsCount = 0
$lfsBytes = 0
$regCount = 0
$regBytes = 0
$bigFiles = @()

foreach ($f in $untracked) {
    if (-not (Test-Path -LiteralPath $f)) { continue }
    $item = Get-Item -LiteralPath $f -Force
    $len  = $item.Length
    $ext  = $item.Extension.ToLower()
    $isLfs = $lfsExts -contains $ext
    if ($isLfs) {
        $lfsCount++
        $lfsBytes += $len
    } else {
        $regCount++
        $regBytes += $len
    }
    if ($len -gt 100MB) {
        $bigFiles += [pscustomobject]@{
            MB   = [math]::Round($len/1MB,1)
            LFS  = $isLfs
            Path = $f
        }
    }
}

Write-Host '=== Staging split ==='
('LFS-tracked    : {0,6} files   {1,8:N2} GB' -f $lfsCount, ($lfsBytes/1GB))
('Regular git    : {0,6} files   {1,8:N2} GB' -f $regCount, ($regBytes/1GB))
('TOTAL          : {0,6} files   {1,8:N2} GB' -f ($lfsCount+$regCount), (($lfsBytes+$regBytes)/1GB))
Write-Host ''
Write-Host '=== Files > 100 MB (GitHub hard limit unless LFS) ==='
if ($bigFiles) { $bigFiles | Sort-Object -Property MB -Descending | Format-Table -AutoSize }
else { 'none' }

Write-Host ''
Write-Host '=== Data-pack requirement ==='
$packs = [math]::Ceiling($lfsBytes/50GB)
('LFS storage needed : {0:N2} GB  ->  {1} Data Pack(s) @ $5/mo each' -f ($lfsBytes/1GB), $packs)
