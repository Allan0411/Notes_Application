using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projectontext.Models;

namespace projectontext.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentTextController : ControllerBase
    {
        private readonly HandwritingappContext context;

        public StudentTextController(HandwritingappContext context)
        {
            this.context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetStudent()
        {
            var notes = await context.Notes.ToListAsync();
            return Ok(notes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await context.Notes.FindAsync(id);

            if (note == null)
                return NotFound();

            return note;
        }

        // POST: api/StudentText
        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote(Note note)
        {
            context.Notes.Add(note);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        // PUT: api/StudentText/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, Note note)
        {
            if (id != note.Id)
                return BadRequest();

            context.Entry(note).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/StudentText/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await context.Notes.FindAsync(id);
            if (note == null)
                return NotFound();

            context.Notes.Remove(note);
            await context.SaveChangesAsync();

            return NoContent();
        }

        private bool NoteExists(int id)
        {
            return context.Notes.Any(e => e.Id == id);
        }



    }
}
