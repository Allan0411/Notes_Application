using CRUDAppUsingASPCoreProject.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;

namespace CRUDAppUsingASPCoreProject.Controllers
{
    public class StudentController : Controller
    {
        public string url = "https://localhost:7019/api/StudentText";



        private HttpClient client = new HttpClient();

        [HttpGet]
        public IActionResult Index()
        {
            List<Student> students = new List<Student>();
            HttpResponseMessage respose = client.GetAsync(url).Result;
            if (respose.IsSuccessStatusCode)
            {
                string result = respose.Content.ReadAsStringAsync().Result;
                var data = JsonConvert.DeserializeObject<List<Student>>(result);
                if(data != null)
                {
                    students = data;
                }
            }
            return View(students);
        }
        [HttpGet]
        public IActionResult Create()
        {
            return View();  
        }

        [HttpPost]
        public IActionResult Create(Student std)
        {
            string data = JsonConvert.SerializeObject(std);
            StringContent content = new StringContent(data,Encoding.UTF8,"application/json");
            HttpResponseMessage respose = client.PostAsync(url, content).Result;
            if (respose.IsSuccessStatusCode)
            {
                TempData["insert_message"] = "Text added.....";
                return RedirectToAction("Index");
            }
            return View();
        }
        [HttpGet]
        public IActionResult Edit(int id)
        {
            Student std = new Student();
            HttpResponseMessage respose = client.GetAsync(url + id).Result;
            if (respose.IsSuccessStatusCode)
            {
                string result = respose.Content.ReadAsStringAsync().Result;
                var data = JsonConvert.DeserializeObject<Student>(result);
                if (data != null)
                {
                    std= data;
                }
            }
            return View(std);
        }
        [HttpPost]
        public IActionResult Edit(Student std)
        {
            string data = JsonConvert.SerializeObject(std);
            StringContent content = new StringContent(data, Encoding.UTF8, "application/json");
            HttpResponseMessage respose = client.PutAsync(url + std.id, content).Result;
            if (respose.IsSuccessStatusCode)
            {
                TempData["update_message"] = "Text updated.....";
                return RedirectToAction("Index");
            }
            return View();
        }
        [HttpGet]
        public IActionResult Details(int id)
        {
            Student std = new Student();
            HttpResponseMessage respose = client.GetAsync(url + id).Result;
            if (respose.IsSuccessStatusCode)
            {
                string result = respose.Content.ReadAsStringAsync().Result;
                var data = JsonConvert.DeserializeObject<Student>(result);
                if (data != null)
                {
                    std = data;
                }
            }
            return View(std);
     
        }
        [HttpGet]
        public IActionResult Delete(int id)
        {
            Student std = new Student();
            HttpResponseMessage respose = client.GetAsync(url + id).Result;
            if (respose.IsSuccessStatusCode)
            {
                string result = respose.Content.ReadAsStringAsync().Result;
                var data = JsonConvert.DeserializeObject<Student>(result);
                if (data != null)
                {
                    std = data;
                }
            }
            return View(std);
        }
        [HttpPost, ActionName("Delete")]
        public IActionResult DeleteConfirmed(int id)
        {
            Student std = new Student();
            HttpResponseMessage respose = client.DeleteAsync(url + id).Result;
            if (respose.IsSuccessStatusCode)
            {
                TempData["delete_message"] = "Text deleted.....";
                return RedirectToAction("Index");
            }
            return View();
        }
    }

}
