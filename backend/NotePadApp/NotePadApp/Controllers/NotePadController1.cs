using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace NotePadApp.Controllers
{
    public class NotePadController : Controller
    {
        private readonly string filePath;

        public NotePadController()
        {
            // Save file to App_Data/Note.txt inside the project folder
            filePath = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "Note.txt");

            // Ensure the folder exists
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        }

        public IActionResult Index()
        {
            string noteText = "";

            if (System.IO.File.Exists(filePath))
            {
                noteText = System.IO.File.ReadAllText(filePath);
            }

            ViewBag.TextData = noteText;
            return View();
        }

        [HttpPost]
        public IActionResult Save(string noteText)
        {
            // Write to file
            System.IO.File.WriteAllText(filePath, noteText);

            ViewBag.Message = "Note saved to file successfully!";
            ViewBag.TextData = noteText;
            return View("Index");
        }
    }
}
