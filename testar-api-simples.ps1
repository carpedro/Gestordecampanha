$PROJECT_ID = "jkplbqingkcmjhyogoiw"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU"
$url = "https://$PROJECT_ID.supabase.co/functions/v1/make-server-a1f709fc/campaigns"

Write-Host "Testando API: $url"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Headers @{"Authorization" = "Bearer $ANON_KEY"} -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Resposta:"
    Write-Host $response.Content
} catch {
    Write-Host "ERRO: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    }
}

