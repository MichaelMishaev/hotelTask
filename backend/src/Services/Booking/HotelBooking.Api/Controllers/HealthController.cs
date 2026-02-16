using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint (INV-DEPLOY-001)
    /// </summary>
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

    /// <summary>
    /// Version endpoint (INV-DEPLOY-002)
    /// </summary>
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
