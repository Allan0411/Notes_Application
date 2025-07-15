using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace NotePadApp.Controllers
{
    public class NotePadController : Controller
    {
        private readonly string notesFolder;

        public NotePadController()
        {
            notesFolder = Path.Combine(Directory.GetCurrentDirectory(), "App_Data");
            Directory.CreateDirectory(notesFolder);
        }

        // Load Note
        public IActionResult Index(string? title)
        {
            string noteText = "";
            string noteTitle = title ?? "Default";

            string filePath = GetNoteFilePath(noteTitle);

            if (System.IO.File.Exists(filePath))
            {
                noteText = System.IO.File.ReadAllText(filePath);
            }

            ViewBag.TextData = noteText;
            ViewBag.NoteTitle = noteTitle;
            return View();
        }

        // Save Note
        [HttpPost]
        public IActionResult Save(string noteTitle, string noteText)
        {
            if (string.IsNullOrWhiteSpace(noteTitle))
            {
                ViewBag.Message = "Note title is required!";
                return View("Index");
            }

            string filePath = GetNoteFilePath(noteTitle);
            System.IO.File.WriteAllText(filePath, noteText);

            ViewBag.Message = $"Note '{noteTitle}' saved successfully!";
            ViewBag.TextData = noteText;
            ViewBag.NoteTitle = noteTitle;
            return View("Index");
        }

        private string GetNoteFilePath(string title)
        {
            // Sanitize file name to avoid special characters
            var fileName = Path.GetInvalidFileNameChars().Aggregate(title, (current, c) => current.Replace(c.ToString(), ""));
            return Path.Combine(notesFolder, $"{fileName}.txt");
        }
        public IActionResult Download(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
                return BadRequest("Note title is required to download.");

            string filePath = GetNoteFilePath(title);

            if (!System.IO.File.Exists(filePath))
                return NotFound("Note not found.");

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            var fileName = $"{title}.txt";

            return File(fileBytes, "text/plain", fileName);
        }
        [HttpPost]
        public IActionResult Upload(IFormFile uploadedFile)
        {
            if (uploadedFile == null || uploadedFile.Length == 0)
            {
                ViewBag.Message = "No file selected.";
                return View("Index");
            }

            if (!uploadedFile.FileName.EndsWith(".txt"))
            {
                ViewBag.Message = "Only .txt files are allowed.";
                return View("Index");
            }

            string noteText = "";
            using (var reader = new StreamReader(uploadedFile.OpenReadStream()))
            {
                noteText = reader.ReadToEnd();
            }

            string fileNameWithoutExt = Path.GetFileNameWithoutExtension(uploadedFile.FileName);
            ViewBag.TextData = noteText;
            ViewBag.NoteTitle = fileNameWithoutExt;
            ViewBag.Message = $"Loaded file '{uploadedFile.FileName}' successfully. You can now edit and save it.";

            return View("Index");
        }


    }
}
