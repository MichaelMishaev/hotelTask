using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.Bookings.Commands.CancelBooking;
using HotelBooking.Application.Bookings.Commands.CreateBooking;
using HotelBooking.Application.Bookings.Commands.UpdateBooking;
using HotelBooking.Application.Bookings.Commands.UpdateBookingStatus;
using HotelBooking.Application.Bookings.Queries.GetBookingById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new booking
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        // INV-RBAC-001: Guests can only create bookings for themselves
        if (userRole == "Guest" && request.GuestId.ToString() != userId)
            return Forbid();

        var command = new CreateBookingCommand(request.GuestId, request.RoomId, request.CheckIn, request.CheckOut);
        var booking = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    /// <summary>
    /// Get a booking by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var booking = await _mediator.Send(new GetBookingByIdQuery(id), ct);

        // INV-RBAC-001: Guests can only view their own bookings
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        if (userRole == "Guest" && booking.GuestId.ToString() != (User.FindFirstValue(ClaimTypes.NameIdentifier) ?? ""))
            return Forbid();

        return Ok(booking);
    }

    /// <summary>
    /// Update booking dates
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBookingRequest request, CancellationToken ct)
    {
        // Check ownership for guests
        var booking = await _mediator.Send(new GetBookingByIdQuery(id), ct);
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        if (userRole == "Guest" && booking.GuestId.ToString() != (User.FindFirstValue(ClaimTypes.NameIdentifier) ?? ""))
            return Forbid();

        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        var command = new UpdateBookingCommand(id, request.CheckIn, request.CheckOut, userEmail);
        var updated = await _mediator.Send(command, ct);
        return Ok(updated);
    }

    /// <summary>
    /// Cancel a booking (soft delete - INV-BOOK-006)
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        // Check ownership for guests
        var booking = await _mediator.Send(new GetBookingByIdQuery(id), ct);
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        if (userRole == "Guest" && booking.GuestId.ToString() != (User.FindFirstValue(ClaimTypes.NameIdentifier) ?? ""))
            return Forbid();

        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        var command = new CancelBookingCommand(id, userEmail);
        var cancelled = await _mediator.Send(command, ct);
        return Ok(cancelled);
    }

    /// <summary>
    /// Update booking status (Staff/Admin only)
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request, CancellationToken ct)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
        var command = new UpdateBookingStatusCommand(id, request.Status, userEmail);
        var updated = await _mediator.Send(command, ct);
        return Ok(updated);
    }
}
