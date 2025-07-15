using System;
using System.Collections.Generic;

namespace projectontext.Models;

public partial class Note
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string? TextContent { get; set; }

    public DateTime? CreatedAt { get; set; }
}
