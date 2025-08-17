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

        private int GetUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(userIdClaim);
        }

        public NotesController(NotesDbContext context)
        {
            _context = context;
        }

        // 1. List all notes user can access (owned/shared, not archived)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            int userId = GetUserId();

            // Owned or shared with user
            var notes = await _context.Notes
                .Where(note =>
                    !note.IsArchived &&
                    (_context.NotesUser.Any(nu => nu.NoteId == note.Id && nu.UserId == userId) ||
                    note.CreatorUserId == userId)
                )
                .ToListAsync();

            return notes;
        }

        // 2. Get single note (if user has access)
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            int userId = GetUserId();

            var note = await _context.Notes
                .FirstOrDefaultAsync(n =>
                    n.Id == id &&
                    (_context.NotesUser.Any(nu => nu.NoteId == n.Id && nu.UserId == userId) ||
                     n.CreatorUserId == userId)
                );

            if (note == null)
                return NotFound();

            note.LastAccessed = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return note;
        }

        // 3. Create a new note
        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(Note note)
        {
            int userId = GetUserId();

            note.CreatorUserId = userId;
            note.CreatedAt = DateTime.UtcNow;
            note.LastAccessed = DateTime.UtcNow;

            _context.Notes.Add(note);
            await _context.SaveChangesAsync(); // SAVE FIRST! Now note.Id is available

            // Now add creator to the join table as owner
            _context.NotesUser.Add(new NotesUser
            {
                NoteId = note.Id,      // Real, DB-assigned note id
                UserId = userId,
                Role = "owner"
            });

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }


        // 4. Update a note (if user is owner/editor)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] Note updatedNote)
        {
            int userId = GetUserId();

            // Only allow if user is collaborator/editor/owner
            var note = await _context.Notes
                .FirstOrDefaultAsync(n =>
                    n.Id == id &&
                    (_context.NotesUser.Any(nu => nu.NoteId == n.Id && nu.UserId == userId) ||
                    n.CreatorUserId == userId)
                );

            if (note == null) return NotFound();

            note.Title = updatedNote.Title;
            note.TextContents = updatedNote.TextContents;
            note.LastAccessed = DateTime.UtcNow;
            note.IsArchived = updatedNote.IsArchived;
            note.IsPrivate = updatedNote.IsPrivate;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. Delete a note (only creator allowed)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            int userId = GetUserId();

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.CreatorUserId == userId);

            if (note == null) return NotFound();

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 6. Add collaborator
        [HttpPost("{noteId}/collaborators")]
        public async Task<IActionResult> AddCollaborator(int noteId, [FromBody] AddCollaboratorRequest request)
        {
            int userId = GetUserId();

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == noteId && n.CreatorUserId == userId);

            if (note == null) return NotFound("Note not found or not owner");

            // Prevent adding self as collaborator
            if (request.UserId == userId)
                return BadRequest("Cannot add yourself as collaborator.");

            // Optionally check for existing collaboration
            var existing = await _context.NotesUser
                .FirstOrDefaultAsync(nu => nu.NoteId == noteId && nu.UserId == request.UserId);

            if (existing != null)
                return BadRequest("User is already a collaborator.");

            // Add to join table
            _context.NotesUser.Add(new NotesUser
            {
                NoteId = noteId,
                UserId = request.UserId,
                Role = request.Role ?? "editor"
            });

            await _context.SaveChangesAsync();
            return Ok();
        }


        // 7. Remove collaborator
        [HttpDelete("{noteId}/collaborators/{collaboratorUserId}")]
        public async Task<IActionResult> RemoveCollaborator(int noteId, int collaboratorUserId)
        {
            int userId = GetUserId();

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == noteId && n.CreatorUserId == userId);

            if (note == null) return NotFound("Note not found or not owner");

            var collab = await _context.NotesUser
                .FirstOrDefaultAsync(nu => nu.NoteId == noteId && nu.UserId == collaboratorUserId);

            if (collab == null) return NotFound("Collaborator not found.");

            _context.NotesUser.Remove(collab);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 8. Archive a note
        [HttpPut("{id}/archive")]
        public async Task<IActionResult> ArchiveNote(int id)
        {
            int userId = GetUserId();
            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.CreatorUserId == userId);

            if (note == null) return NotFound();

            note.IsArchived = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 9. Unarchive a note
        [HttpPut("{id}/unarchive")]
        public async Task<IActionResult> UnarchiveNote(int id)
        {
            int userId = GetUserId();
            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.CreatorUserId == userId);

            if (note == null) return NotFound();

            note.IsArchived = false;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 10. Export a note (example stub)
        [HttpGet("{id}/export")]
        public async Task<IActionResult> ExportNote(int id)
        {
            int userId = GetUserId();
            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id &&
                    (_context.NotesUser.Any(nu => nu.NoteId == n.Id && nu.UserId == userId) ||
                    n.CreatorUserId == userId)
                );

            if (note == null) return NotFound();

            // You'd implement actual export logic—PDF, docx, etc.
            var exportContent = $"Title: {note.Title}\n\nContent:\n{note.TextContents}";
            return File(System.Text.Encoding.UTF8.GetBytes(exportContent), "text/plain", $"note-{id}.txt");
        }
    }
}
