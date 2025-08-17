using Microsoft.AspNetCore.Mvc;
using NotesAPI.Services; // Add this at the top


[Route("api/")]
public class AIController : ControllerBase
{

    
    private readonly GeminiService _geminiService;
    public AIController(GeminiService geminiService)
    {
        _geminiService = geminiService;
    }
    [HttpPost("summarize")]
    public async Task<IActionResult> SummarizeText([FromBody] SummarizeRequest body)
    {
        if (body == null || body.Text == null)
            return BadRequest(new { message = "Provide the text to summarize." });

        var prompt = $"Summarize the following content in 3-5 clear, concise sentences. Avoid generic phrases and focus on the main points:\n\n{body.Text}";
        var aiResponse = await _geminiService.GenerateContent(prompt);
        return Ok(new { aiResponse, text = body.Text });
    }

    [HttpPost("expand")]
    public async Task<IActionResult> ExpandText([FromBody] SummarizeRequest body)
    {
        if (body == null || body.Text == null)
            return BadRequest(new { message = "Provide the text to expand." });

        var prompt = $"Expand on the following content in deeply detailed, well-structured paragraphs. Provide precise, contextually relevant elaboration. Do not include generic introductions or endings, only the expanded content:\n\n{body.Text}";
        var aiResponse = await _geminiService.GenerateContent(prompt);
        return Ok(new { aiResponse, text = body.Text });
    }

    [HttpPost("shorten")]
    public async Task<IActionResult> ShortenText([FromBody] SummarizeRequest body)
    {
        if (body == null || body.Text == null)
            return BadRequest(new { message = "Provide the text to shorten." });

        var prompt = $"Rewrite the following content to be as concise as possible while preserving all key information. Use short, clear sentences only:\n\n{body.Text}";
        var aiResponse = await _geminiService.GenerateContent(prompt);
        return Ok(new { aiResponse, text = body.Text });
    }

    [HttpPost("fix_grammar")]
    public async Task<IActionResult> FixGrammar([FromBody] SummarizeRequest body)
    {
        if (body == null || body.Text == null)
            return BadRequest(new { message = "Provide the text for grammar correction." });

        var prompt = $"Carefully correct all grammar, punctuation, and spelling mistakes in the following text. Preserve original meaning. Only provide the corrected version:\n\n{body.Text}";
        var aiResponse = await _geminiService.GenerateContent(prompt);
        return Ok(new { aiResponse, text = body.Text });
    }

    [HttpPost("make_formal")]
    public async Task<IActionResult> MakeFormal([FromBody] SummarizeRequest body)
    {
        if (body == null || body.Text == null)
            return BadRequest(new { message = "Provide the text to formalize." });

        var prompt = $"Rewrite the following content in a professional, academic tone suitable for formal communication. Use complete sentences and formal vocabulary, but do not use generic headers or closings. Provide only the improved version:\n\n{body.Text}";
        var aiResponse = await _geminiService.GenerateContent(prompt);
        return Ok(new { aiResponse, text = body.Text });
    }
}



