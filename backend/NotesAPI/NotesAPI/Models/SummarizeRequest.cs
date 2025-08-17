using System.Text.Json.Serialization;

public class SummarizeRequest
{
    [JsonPropertyName("text")]
    public string Text { get; set; }
}
