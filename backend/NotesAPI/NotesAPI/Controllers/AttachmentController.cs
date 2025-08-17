using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesAPI.Data;
using NotesAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace NotesAPI.Controllers
{
    [Authorize]
    [Route("api/notes/{noteId}/attachments")]
    [ApiController]
    public class AttachmentController : ControllerBase
    {
        private readonly NotesDbContext _context;

        public AttachmentController(NotesDbContext context)
        {
            _context = context;
        }

        // GET: api/notes/{noteId}/attachments
        [HttpGet]
        public async Task<ActionResult> GetAttachments(int noteId)
        {
            // Optional: add permission check here if required

            var attachments = await _context.Attachments
                .Where(a => a.NoteId == noteId)
                .ToListAsync();

            return Ok(attachments);
        }

        // POST: api/notes/{noteId}/attachments
        [HttpPost]
        public async Task<IActionResult> AddAttachment(int noteId, [FromBody] AddAttachmentRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.AttachmentType)
                || string.IsNullOrWhiteSpace(request.StoragePath))
            {
                return BadRequest("Invalid attachment data.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);


            // Optional: Check if note exists and current user can add
            var note = await _context.Notes.FindAsync(noteId);
            if (note == null)
                return NotFound("Note not found.");

            var attachment = new Attachment
            {
                NoteId = noteId,
                AttachmentType = request.AttachmentType,
                StoragePath = request.StoragePath,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttachments), new { noteId = noteId }, attachment);
        }

        // DELETE: api/notes/{noteId}/attachments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttachment(int noteId, int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(); // or handle missing user ID gracefully

            int userId = int.Parse(userIdClaim.Value);


            var attachment = await _context.Attachments
                .FirstOrDefaultAsync(a => a.Id == id && a.NoteId == noteId);

            if (attachment == null)
                return NotFound("Attachment not found.");

            // Optional: Only creator or note owner can delete
            // Here you could add: check if userId == attachment.CreatedByUserId or is a note collaborator/owner
            // Example:
            // var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == noteId);
            // if (note?.CreatorUserId != userId && attachment.CreatedByUserId != userId)
            //     return Forbid();

            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
