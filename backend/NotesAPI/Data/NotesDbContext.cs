using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using NotesAPI.Models;

namespace NotesAPI.Data
{
    public partial class NotesDbContext : DbContext
    {
        public NotesDbContext()
        {
        }

        public NotesDbContext(DbContextOptions<NotesDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Note> Notes { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // TODO: Move connection string to appsettings.json for safety.
                //optionsBuilder.UseMySql(
                //    ,
                //    ServerVersion.Parse("10.4.32-mariadb")
                //);

                // Recommended: Use appsettings.json instead
                // optionsBuilder.UseMySql(
                //     configuration.GetConnectionString("DefaultConnection"),
                //     ServerVersion.AutoDetect(configuration.GetConnectionString("DefaultConnection"))
                // );
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.UseCollation("utf8mb4_general_ci")
                        .HasCharSet("utf8mb4");

            modelBuilder.Entity<Note>(entity =>
            {
                entity.ToTable("notes");

                entity.Property(e => e.Id)
                    .HasColumnType("int(11)")
                    .HasColumnName("id");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("timestamp")
                    .HasColumnName("createdAt")
                    .HasDefaultValueSql("current_timestamp()");

                entity.Property(e => e.LastAccessed)
                    .HasColumnType("timestamp")
                    .HasColumnName("lastAccessed")
                    .HasDefaultValueSql("current_timestamp()")
                    .ValueGeneratedOnAddOrUpdate();

                entity.Property(e => e.S3Contents)
                    .HasColumnType("text")
                    .HasColumnName("s3Contents");

                entity.Property(e => e.TextContents)
                    .HasColumnType("text")
                    .HasColumnName("textContents");

                entity.Property(e => e.Title)
                    .HasMaxLength(255)
                    .HasColumnName("title");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
        public virtual DbSet<User> Users { get; set; } = null!;

    }
}
