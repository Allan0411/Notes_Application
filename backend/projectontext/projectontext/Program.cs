using projectontext.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<HandwritingappContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("dbcs"),
    new MySqlServerVersion(new Version(8, 0, 0))));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Commented out HTTPS redirection to allow mobile HTTP access
app.UseHttpsRedirection();

app.UseAuthorization();

// ? Set URL BEFORE app.Run()
//app.Urls.Add("http://0.0.0.0:7019");

app.MapControllers();

app.Run();
