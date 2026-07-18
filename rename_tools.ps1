$toolsDir = "C:\Users\avram\Documents\antigravity\joyful-bell\static\tools"
$articlesDir = "C:\Users\avram\Documents\antigravity\joyful-bell\static\articles"

$renames = @(
    @{ Pattern = "a_micro-canvas*"; ToolName = "code_screenshot_generator_tool.html"; ArticleName = "code_screenshot_generator.html" },
    @{ Pattern = "converts_a_plain*"; ToolName = "json_to_typescript_converter_tool.html"; ArticleName = "json_to_typescript_converter.html" },
    @{ Pattern = "generates_a_temporary*"; ToolName = "webhook_request_inspector_tool.html"; ArticleName = "webhook_request_inspector.html" },
    @{ Pattern = "users_paste_a_raw*"; ToolName = "openapi_documentation_viewer_tool.html"; ArticleName = "openapi_documentation_viewer.html" }
)

foreach ($r in $renames) {
    $toolFile = Get-ChildItem $toolsDir -Filter "$($r.Pattern)_tool.html" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($toolFile) {
        $newPath = Join-Path $toolsDir $r.ToolName
        Move-Item $toolFile.FullName $newPath -Force
        Write-Host "Renamed tool: $($toolFile.Name) -> $($r.ToolName)"
    } else {
        Write-Host "Tool not found for pattern: $($r.Pattern)"
    }

    $artFile = Get-ChildItem $articlesDir -Filter "$($r.Pattern)*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($artFile) {
        $newPath = Join-Path $articlesDir $r.ArticleName
        Move-Item $artFile.FullName $newPath -Force
        Write-Host "Renamed article: $($artFile.Name) -> $($r.ArticleName)"
    } else {
        Write-Host "Article not found for pattern: $($r.Pattern)"
    }
}

Write-Host "`nAll renames complete."
