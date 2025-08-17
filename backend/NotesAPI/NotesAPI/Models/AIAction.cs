using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesAPI.Models
{
    [Table("ai_actions")]
    public class AIAction
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("noteId")]
        public int NoteId { get; set; }

        [Column("userId")]
        public int UserId { get; set; }

        [Column("actionType")]
        [MaxLength(50)]
        public string? ActionType { get; set; } // 'summarize', 'ocr-math', etc.

        [Column("inputData")]
        public string? InputData { get; set; }

        [Column("outputData")]
        public string? OutputData { get; set; }

        [Column("createdAt")]
        public DateTime? CreatedAt { get; set; }

        // Navigation properties (optional)
        // public virtual Note Note { get; set; }
        // public virtual User User { get; set; }
    }
}
