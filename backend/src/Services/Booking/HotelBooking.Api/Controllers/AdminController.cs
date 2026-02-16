using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.Admin.Commands;
using HotelBooking.Application.Admin.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardStatsQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get user counts by role
    /// </summary>
    [HttpGet("dashboard/user-counts")]
    public async Task<IActionResult> GetUserCounts(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserCountsQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get recent audit log entries
    /// </summary>
    [HttpGet("audit-log")]
    public async Task<IActionResult> GetAuditLog([FromQuery] int limit = 50, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAuditLogQuery(limit), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get all users with optional filters
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAllUsersQuery(search, role, page, limit), ct);
        return Ok(result);
    }

    /// <summary>
    /// Update a user (demo-only with mock users)
    /// </summary>
    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateUserCommand(id, request.Name, request.Email, request.Role), ct);
        return Ok(result);
    }

    /// <summary>
    /// Delete a user (demo-only with mock users)
    /// </summary>
    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());
        await _mediator.Send(new DeleteUserCommand(id, currentUserId), ct);
        return NoContent();
    }

    /// <summary>
    /// Get revenue analytics by period (daily, weekly, monthly)
    /// </summary>
    [HttpGet("analytics/revenue")]
    public async Task<IActionResult> GetRevenueAnalytics([FromQuery] string period = "monthly", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetRevenueAnalyticsQuery(period), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get occupancy analytics by period (daily, weekly, monthly)
    /// </summary>
    [HttpGet("analytics/occupancy")]
    public async Task<IActionResult> GetOccupancyAnalytics([FromQuery] string period = "monthly", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetOccupancyAnalyticsQuery(period), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get bookings grouped by room type
    /// </summary>
    [HttpGet("analytics/bookings-by-type")]
    public async Task<IActionResult> GetBookingsByType(CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetBookingsByTypeQuery(), ct);
        return Ok(result);
    }
}
