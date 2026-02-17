using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            buildId = Environment.GetEnvironmentVariable("BUILD_ID") ?? "local-dev"
        });
    }

    [HttpGet("version")]
    public IActionResult Version()
    {
        return Ok(new
        {
            buildId = Environment.GetEnvironmentVariable("BUILD_ID") ?? "local-dev",
            serverTime = DateTime.UtcNow
        });
    }
}
