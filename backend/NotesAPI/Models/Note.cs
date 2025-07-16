using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotesAPI.Models
{
    [Table("notes")]
    public class Note
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("title")]
        [MaxLength(255)]
        public string? Title { get; set; }

        [Column("textContents")]
        public string? TextContents { get; set; }

        [Column("s3Contents")]
        public string? S3Contents { get; set; }

        [Column("createdAt")]
        public DateTime? CreatedAt { get; set; }

        [Column("lastAccessed")]
        public DateTime? LastAccessed { get; set; } // Renamed to match usage

        [Column("userEmail")]
        public string? Note_Email { get; set; }

    }
}
