$searchPath = "C:\Users\ASHWITH\.gemini\antigravity\scratch\DRISHTI\frontend\src"

$replacements = @{
    "\brounded-3xl\b" = "rounded-md"
    "\brounded-2xl\b" = "rounded-md"
    "\brounded-xl\b" = "rounded-sm"
    "\brounded-lg\b" = "rounded-sm"
    "\bbackdrop-blur-xl\b" = ""
    "\bbackdrop-blur-md\b" = ""
    "\bbackdrop-blur-sm\b" = ""
    "\bbg-black/40\b" = "bg-[#0a0a0a]"
    "\bbg-black/50\b" = "bg-[#0a0a0a]"
    "\bbg-black/60\b" = "bg-[#111111]"
    "\bbg-black/80\b" = "bg-[#111111]"
    "\bbg-gradient-to-br from-\[#1e293b\]/90 to-\[#0f172a\]/90\b" = "bg-[#1e293b]"
    "\bbg-gradient-to-b from-black/80 to-black/40\b" = "bg-[#0a0a0a]"
    "\bbg-gradient-to-b from-transparent to-\[#050505\]\b" = "bg-[#050505]"
    "\banimate-\[shimmer_1\.5s_infinite\]\b" = ""
    "\banimate-bounce\b" = ""
}

Get-ChildItem -Path $searchPath -Recurse -Filter *.tsx | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    $originalContent = $content

    foreach ($pattern in $replacements.Keys) {
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacements[$pattern])
    }

    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content
        Write-Output "Updated: $($_.FullName)"
    }
}
