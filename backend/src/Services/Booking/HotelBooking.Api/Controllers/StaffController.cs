using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.Staff.Commands;
using HotelBooking.Application.Staff.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/staff")]
[Authorize(Roles = "Staff,Admin")]
public class StaffController : ControllerBase
{
    private readonly IMediator _mediator;

    public StaffController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get today's check-ins
    /// </summary>
    [HttpGet("dashboard/today-checkins")]
    public async Task<IActionResult> GetTodayCheckIns(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTodayCheckInsQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get today's check-outs
    /// </summary>
    [HttpGet("dashboard/today-checkouts")]
    public async Task<IActionResult> GetTodayCheckOuts(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTodayCheckOutsQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get all rooms with optional status filter
    /// </summary>
    [HttpGet("rooms")]
    public async Task<IActionResult> GetAllRooms([FromQuery] string? status, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllRoomsQuery(status), ct);
        return Ok(result);
    }

    /// <summary>
    /// Update room status (Available, Maintenance, OutOfService)
    /// </summary>
    [HttpPut("rooms/{id:guid}/status")]
    public async Task<IActionResult> UpdateRoomStatus(Guid id, [FromBody] UpdateRoomStatusRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateRoomStatusCommand(id, request.Status), ct);
        return Ok(result);
    }

    /// <summary>
    /// Check in a booking (sets room to Occupied)
    /// </summary>
    [HttpPost("bookings/{id:guid}/check-in")]
    public async Task<IActionResult> CheckIn(Guid id, CancellationToken ct)
    {
        var staffEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        var result = await _mediator.Send(new CheckInBookingCommand(id, staffEmail), ct);
        return Ok(result);
    }

    /// <summary>
    /// Check out a booking (sets room to Available)
    /// </summary>
    [HttpPost("bookings/{id:guid}/check-out")]
    public async Task<IActionResult> CheckOut(Guid id, CancellationToken ct)
    {
        var staffEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        var result = await _mediator.Send(new CheckOutBookingCommand(id, staffEmail), ct);
        return Ok(result);
    }

    /// <summary>
    /// Get all bookings with optional filters (status, search, pagination)
    /// </summary>
    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetStaffBookingsQuery(status, search, page, limit), ct);
        return Ok(result);
    }
}
