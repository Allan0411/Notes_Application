using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesAPI.Data;
using NotesAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NotesAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly NotesDbContext _context;

        public NotesController(NotesDbContext context)
        {
            _context = context;
        }

        // GET: api/notes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            return await _context.Notes
                .Where(n => n.Note_Email == userEmail)
                .ToListAsync();
        }

        // GET: api/notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.Note_Email == userEmail);

            if (note == null)
                return NotFound();

            note.LastAccessed = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return note;
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(Note note)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            note.Note_Email = userEmail;
            note.CreatedAt = DateTime.UtcNow;
            note.LastAccessed = DateTime.UtcNow;

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        // PUT: api/notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] Note updatedNote)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.Note_Email == userEmail);

            if (note == null)
                return NotFound();

            if (updatedNote == null)
                return BadRequest("Note data is required.");

            // Only update allowed fields
            note.Title = updatedNote.Title;
            note.TextContents = updatedNote.TextContents;
            note.S3Contents = updatedNote.S3Contents;
            note.LastAccessed = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.Note_Email == userEmail);

            if (note == null)
                return NotFound();

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
