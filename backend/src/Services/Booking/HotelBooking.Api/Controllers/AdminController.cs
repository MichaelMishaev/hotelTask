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

    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardStatsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("dashboard/user-counts")]
    public async Task<IActionResult> GetUserCounts(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserCountsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("audit-log")]
    public async Task<IActionResult> GetAuditLog([FromQuery] int limit = 50, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAuditLogQuery(limit), ct);
        return Ok(result);
    }

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

    // only works with mock users in demo mode
    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateUserCommand(id, request.Name, request.Email, request.Role), ct);
        return Ok(result);
    }

    // demo only - prevents deleting yourself
    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());
        await _mediator.Send(new DeleteUserCommand(id, currentUserId), ct);
        return NoContent();
    }

    [HttpGet("analytics/revenue")]
    public async Task<IActionResult> GetRevenueAnalytics([FromQuery] string period = "monthly", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetRevenueAnalyticsQuery(period), ct);
        return Ok(result);
    }

    [HttpGet("analytics/occupancy")]
    public async Task<IActionResult> GetOccupancyAnalytics([FromQuery] string period = "monthly", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetOccupancyAnalyticsQuery(period), ct);
        return Ok(result);
    }

    [HttpGet("analytics/bookings-by-type")]
    public async Task<IActionResult> GetBookingsByType(CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetBookingsByTypeQuery(), ct);
        return Ok(result);
    }
}
