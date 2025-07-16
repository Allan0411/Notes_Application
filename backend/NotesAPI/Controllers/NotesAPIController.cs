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
            var user_email= User.FindFirstValue(ClaimTypes.Email);
            var user_notes= await _context.Notes.Where(n=>n.Note_Email==user_email).ToListAsync();
            return user_notes;
        }

        // GET: api/notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);

            if (note == null)
                return NotFound();

            note.LastAccessed = DateTime.Now;
            await _context.SaveChangesAsync();

            return note;
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(Note note)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email); // 👈 from JWT
            note.Note_Email = userEmail;
            note.CreatedAt = DateTime.Now;
            note.LastAccessed = DateTime.Now;

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        // PUT: api/notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, Note note)
        {
            if (id != note.Id)
                return BadRequest();

            var existing = await _context.Notes.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Title = note.Title;
            existing.TextContents = note.TextContents;
            existing.S3Contents = note.S3Contents;
            existing.LastAccessed = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null)
                return NotFound();

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        
    }
}
