using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesAPI.Models
{
    [Table("notes_users")]
    public class NotesUser
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("noteId")]
        public int NoteId { get; set; }

        [Column("userId")]
        public int UserId { get; set; }

        [Column("role")]
        [MaxLength(20)]
        public string? Role { get; set; } = "editor";

        // Navigation properties (optional, helpful for EF)
        // public virtual Note Note { get; set; }
        // public virtual User User { get; set; }
    }
}
