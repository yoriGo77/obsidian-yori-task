#Requires -Version 5.1
<#
.SYNOPSIS
  在本仓库目录执行：基于 manifest.json 的 version，为已存在的同名 tag 创建 GitHub Release，并上传 main.js / manifest.json / styles.css。

.DESCRIPTION
  需要先推送到远端（tag 必须与 manifest 版本一致，例如 manifest 为 1.1.1 则远端须有 tag：1.1.1）。
  Token：设置环境变量 GITHUB_TOKEN（或 GH_TOKEN），需勾选 repo scope。

.USAGE
  cd <仓库根目录>
  $env:GITHUB_TOKEN = "<你的Fine-grained 或 Classic PAT>"
  .\scripts\publish-github-release.ps1

  可选追加说明：
  .\scripts\publish-github-release.ps1 -ReleaseNotes "## 变更`n- 修复 ..."
#>
param(
  [string] $ReleaseNotes = ""
)

$ErrorActionPreference = "Stop"

$token = $env:GITHUB_TOKEN
if (-not $token) { $token = $env:GH_TOKEN }
if (-not $token -or $token.Trim().Length -lt 10) {
  Write-Error "请设置环境变量 GITHUB_TOKEN 或 GH_TOKEN（需含 repo / contents / releases 权限）。"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot.Path

$manifestPath = Join-Path $repoRoot "manifest.json"
if (-not (Test-Path $manifestPath)) {
  Write-Error "找不到 manifest.json"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = [string]$manifest.version
$version = $version.Trim()
if (-not $version) {
  Write-Error "manifest.json 中缺少 version"
}

foreach ($rel in @("main.js", "manifest.json", "styles.css")) {
  if (-not (Test-Path (Join-Path $repoRoot $rel))) {
    Write-Error "缺少发布文件：$rel"
  }
}

$remoteUrl = (git remote get-url origin 2>$null)
if (-not $remoteUrl) {
  Write-Error "未能读取 git remote origin"
}
$m = [regex]::Match($remoteUrl, "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)")
if (-not $m.Success) {
  Write-Error "无法从 origin URL 解析 owner/repo：$remoteUrl"
}
$owner = $m.Groups["owner"].Value
$repoName = $m.Groups["repo"].Value

$headers = @{
  "Authorization"    = "Bearer $token"
  "Accept"           = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
  "User-Agent"       = "yori-task-publish-github-release-script"
}

$tagName = $version
$apiBase = "https://api.github.com/repos/$owner/$repoName"

Write-Host "Repo: $owner/$repoName  Tag: $tagName"

# 校验远端是否已有 tag（避免建好 Release 却无对应 tag）
try {
  Invoke-RestMethod -Uri "$apiBase/git/ref/tags/$tagName" -Headers $headers -Method Get | Out-Null
}
catch {
  Write-Error "远端不存在标签 ``$tagName``。请先执行：git push origin ``$tagName``"
}

if (-not $ReleaseNotes.Trim()) {
  $ReleaseNotes = @(
    "## Yori Task $version",
    "",
    "- 见附件：`main.js`、`manifest.json`、`styles.css`。"
  ) -join "`n"
}

$bodyObj = @{
  tag_name               = $tagName
  name                   = "v$version"
  body                   = $ReleaseNotes
  draft                  = $false
  prerelease             = $false
  generate_release_notes = $false
}

$release = $null
try {
  $release = Invoke-RestMethod `
    -Uri "$apiBase/releases" `
    -Headers $headers `
    -Method Post `
    -Body ($bodyObj | ConvertTo-Json -Depth 5) `
    -ContentType "application/json"
}
catch {
  $code = $null
  if ($null -ne $_.Exception.Response) {
    $code = [int]$_.Exception.Response.StatusCode
  }
  if ($code -eq 422) {
    Write-Error "创建 Release 失败：该 tag 上可能已有 Release。请在 GitHub 删除对应 Release 后重试，或提升 manifest 版本并重新打 tag。`n$($_.Exception.Message)"
  }
  throw
}

# upload_url 形如 .../releases/123/assets{?name,label}
$uploadTpl = $release.upload_url -replace '\{\?[^}]+\}', ''
if (-not $uploadTpl) {
  Write-Error "API 响应缺少 upload_url"
}

function Publish-Asset {
  param(
    [Parameter(Mandatory)][string]$FileName
  )
  $full = Join-Path $repoRoot $fileName
  $enc = [System.Uri]::EscapeDataString($fileName)
  $uri = "${uploadTpl}?name=$enc"
  Write-Host "上传 $fileName ..."
  Invoke-RestMethod -Uri $uri -Headers $headers -Method Post -InFile $full -ContentType "application/octet-stream"
}

Publish-Asset "main.js"
Publish-Asset "manifest.json"
Publish-Asset "styles.css"

$releaseHtml = $release.html_url
if (-not $releaseHtml) {
  $releaseHtml = "https://github.com/$owner/$repoName/releases/tag/$tagName"
}

Write-Host ""
Write-Host "完成。Release 页面：" $releaseHtml
