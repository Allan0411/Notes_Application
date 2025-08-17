using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesAPI.Data;
using NotesAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NotesAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotesUserController : ControllerBase
    {
        private readonly NotesDbContext _context;

        public NotesUserController(NotesDbContext context)
        {
            _context = context;
        }

        // GET: api/NotesUser/note/5
        [HttpGet("note/{noteId}")]
        public async Task<ActionResult<IEnumerable<NotesUser>>> GetCollaborators(int noteId)
        {
            return await _context.NotesUser
                        .Where(nu => nu.NoteId == noteId)
                        .ToListAsync();
        }

        // POST: api/NotesUser
        [HttpPost]
        public async Task<ActionResult<NotesUser>> AddCollaborator([FromBody] NotesUser notesUser)
        {
            _context.NotesUser.Add(notesUser);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCollaborators), new { noteId = notesUser.NoteId }, notesUser);
        }

        // DELETE: api/NotesUser/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveCollaborator(int id)
        {
            var notesUser = await _context.NotesUser.FindAsync(id);
            if (notesUser == null)
                return NotFound();

            _context.NotesUser.Remove(notesUser);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
