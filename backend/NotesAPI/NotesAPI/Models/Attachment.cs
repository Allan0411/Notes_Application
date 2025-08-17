using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesAPI.Models
{
    [Table("attachments")]
    public class Attachment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("noteId")]
        public int NoteId { get; set; }

        [Column("attachmentType")]
        [MaxLength(50)]
        public string? AttachmentType { get; set; }

        [Column("storagePath")]
        [MaxLength(500)]
        public string? StoragePath { get; set; }

        [Column("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [Column("createdByUserId")]
        public int CreatedByUserId { get; set; }

        // Navigation properties (optional)
        // public virtual Note Note { get; set; }
        // public virtual User CreatedByUser { get; set; }
    }
}
