namespace NotesAPI.Models
{
    public class AddCollaboratorRequest
    {
        public int UserId { get; set; }
        public string Role { get; set; } = "editor"; // Optional, defaults to 'editor'
    }
}
