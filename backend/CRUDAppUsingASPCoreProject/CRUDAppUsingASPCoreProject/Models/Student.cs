using System.ComponentModel.DataAnnotations;

namespace CRUDAppUsingASPCoreProject.Models
{
    public class Student
    {
        public int id { get; set; }
        
        public string title { get; set; }
        [Required]
        public string textContent { get; set; }
        
        public DateTime createdAt { get; set; }
    }




}


