using HotelBooking.Api.Models;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(IJwtTokenService jwtTokenService)
    {
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// Demo login with mock users
    /// </summary>
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = MockUsers.FindByEmail(request.Email);
        if (user == null || user.Password != request.Password)
            return Unauthorized(new ProblemDetails
            {
                Status = 401,
                Title = "Unauthorized",
                Detail = "Invalid email or password."
            });

        var token = _jwtTokenService.GenerateToken(
            user.Id.ToString(), user.Email, $"{user.FirstName} {user.LastName}", user.Role);

        return Ok(new LoginResponse(token, user.Id.ToString(),
            $"{user.FirstName} {user.LastName}", user.Email, user.Role));
    }

    /// <summary>
    /// Get available demo users for login page
    /// </summary>
    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = MockUsers.Users.Select(u => new UserInfo(
            u.Id.ToString(), $"{u.FirstName} {u.LastName}", u.Email, u.Role));
        return Ok(users);
    }
}
