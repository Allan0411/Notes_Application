namespace projectontext.Models
{
    public class User
    {
        public int id { get; set; }
        public string email { get; set; }
        public string password { get; set; }

        public ICollection<Note>? Notes { get; set; }
    }
}
