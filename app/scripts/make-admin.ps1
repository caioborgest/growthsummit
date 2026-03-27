$url = "https://xeuqtxxhncvechrxerqw.supabase.co"
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA4NTc4NDU1MH0.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU"
$email = "projetos@cbxgrowth.com.br"

$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}

Write-Host "Searching for user $email..."
$user = Invoke-RestMethod -Uri "$url/rest/v1/users?email=eq.$email&select=id" -Method Get -Headers $headers

if ($user) {
    $userId = $user[0].id
    Write-Host "Found User ID: $userId"

    Write-Host "Updating public.users role..."
    $updateResponse = Invoke-RestMethod -Uri "$url/rest/v1/users?id=eq.$userId" -Method Patch -Headers $headers -Body (@{role="admin"} | ConvertTo-Json)
    
    Write-Host "Updating auth metadata..."
    $authHeaders = @{
        "Authorization" = "Bearer $key"
        "Content-Type" = "application/json"
    }
    $authBody = @{
        user_metadata = @{
            role = "admin"
        }
    } | ConvertTo-Json
    
    $authResponse = Invoke-RestMethod -Uri "$url/auth/v1/admin/users/$userId" -Method Put -Headers $authHeaders -Body $authBody
    
    Write-Host "Success! User $email is now an admin."
} else {
    Write-Host "User $email not found."
}
