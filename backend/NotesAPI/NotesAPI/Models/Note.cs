using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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
        [JsonIgnore]
        [BindNever]
        public DateTime? CreatedAt { get; set; }

        [Column("lastAccessed")]
        [JsonIgnore]
        [BindNever]
        public DateTime? LastAccessed { get; set; } // Renamed to match usage

        [Column("userEmail")]
        [JsonIgnore]
        [BindNever]
        public string? Note_Email { get; set; }

    }
}
