using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace NotesAPI.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _geminiApiKey;
        private readonly string _model; // e.g., "gemini-1.5-flash-001"

        public GeminiService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _geminiApiKey = config["Gemini:ApiKey"]; // Store your key in appsettings.json or an environment variable
            _model = config["Gemini:Model"] ?? "gemini-1.5-flash-001";
        }

        public async Task<string> GenerateContent(string prompt)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent";
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url + $"?key={_geminiApiKey}")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new System.Exception($"Gemini API error: {response.StatusCode}: {responseContent}");
            }

            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;
            var text = root
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text;
        }
    }
}
