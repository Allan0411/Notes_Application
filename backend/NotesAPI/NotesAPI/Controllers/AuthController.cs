using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NotesAPI.Data;
using NotesAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;


namespace NotesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly NotesDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(NotesDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email || u.Username == user.Username))
                return BadRequest("User already exists");

            user.PasswordHash = HashPassword(user.PasswordHash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Registered successfully");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO login)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);
            if (user == null || !VerifyPassword(login.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            var token = GenerateJwt(user);
            return Ok(new { token });
        }

        // Password Hashing
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        // JWT Generation
        private string GenerateJwt(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email,user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginDTO
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
