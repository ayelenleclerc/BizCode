param(
  [Parameter(Mandatory = $false)]
  [string]$Owner,
  [Parameter(Mandatory = $false)]
  [string]$Repo = "BizCode",
  [Parameter(Mandatory = $false)]
  [string]$ProjectTitle = "BizCode Delivery",
  [Parameter(Mandatory = $false)]
  [switch]$SkipProject
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
  throw "GitHub CLI not found at '$gh'."
}

function Invoke-GhJson {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  $output = & $gh @Args
  if ([string]::IsNullOrWhiteSpace($output)) {
    return $null
  }
  return ($output | ConvertFrom-Json)
}

Write-Host "Checking GitHub authentication..."
& $gh auth status | Out-Null

if (-not $Owner) {
  Write-Host "Resolving owner from git remote..."
  $remote = git remote get-url origin
  if ($remote -match "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)") {
    $Owner = $Matches["owner"]
    if (-not $Repo) {
      $Repo = $Matches["repo"]
    }
  } else {
    throw "Could not infer owner/repo from origin remote."
  }
}

Write-Host "Using repository: $Owner/$Repo"

Write-Host "Syncing labels from .github/labels.json..."
$labels = Get-Content ".github/labels.json" -Raw | ConvertFrom-Json
foreach ($label in $labels) {
  $found = & $gh label list --repo "$Owner/$Repo" --search $label.name --json name --jq ".[0].name"
  $exists = -not [string]::IsNullOrWhiteSpace($found)

  if ($exists) {
    & $gh label edit $label.name --repo "$Owner/$Repo" --color $label.color --description $label.description | Out-Null
    Write-Host "Updated label: $($label.name)"
  } else {
    & $gh label create $label.name --repo "$Owner/$Repo" --color $label.color --description $label.description | Out-Null
    Write-Host "Created label: $($label.name)"
  }
}

Write-Host "Configuring branch protection for main..."
$protectionBody = @{
  required_status_checks = @{
    strict = $true
    contexts = @("Quality Gate")
  }
  enforce_admins = $true
  required_pull_request_reviews = @{
    dismiss_stale_reviews = $true
    require_code_owner_reviews = $false
    required_approving_review_count = 1
  }
  restrictions = $null
  allow_force_pushes = $false
  allow_deletions = $false
  required_conversation_resolution = $true
} | ConvertTo-Json -Depth 8

$tempFile = New-TemporaryFile
Set-Content -Path $tempFile -Value $protectionBody -Encoding UTF8
& $gh api `
  --method PUT `
  "repos/$Owner/$Repo/branches/main/protection" `
  -H "Accept: application/vnd.github+json" `
  --input $tempFile | Out-Null
$protectionExitCode = $LASTEXITCODE
Remove-Item $tempFile -Force

if ($protectionExitCode -eq 0) {
  Write-Host "Branch protection configured."
} else {
  Write-Warning "Branch protection could not be configured. GitHub plan may not support it on private repositories."
}

if (-not $SkipProject) {
  Write-Host "Creating Project V2 '$ProjectTitle'..."
  $project = Invoke-GhJson -Args @("project", "create", "--owner", $Owner, "--title", $ProjectTitle, "--format", "json")
  if ($null -eq $project -or -not $project.PSObject.Properties.Name.Contains("number")) {
    throw "Project creation failed. Ensure token includes project scope: gh auth refresh -h github.com -s project,read:project"
  }
  $projectNumber = $project.number
  Write-Host "Project created: #$projectNumber"

  Write-Host "IMPORTANT: Configure custom fields in the GitHub UI now."
  Write-Host "Then set repository variables for automation workflow:"
  Write-Host "- PROJECT_V2_ID"
  Write-Host "- PROJECT_STATUS_FIELD_ID"
  Write-Host "- PROJECT_STATUS_OPTION_BACKLOG"
  Write-Host "- PROJECT_STATUS_OPTION_IN_PROGRESS"
  Write-Host "- PROJECT_STATUS_OPTION_DONE"
  Write-Host "- PROJECT_STATUS_OPTION_BLOCKED (optional)"
}

Write-Host "Phase 1 GitHub setup completed."
