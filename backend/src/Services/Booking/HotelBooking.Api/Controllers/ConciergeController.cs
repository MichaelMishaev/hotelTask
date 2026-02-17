using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.Concierge.Commands;
using HotelBooking.Application.Concierge.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConciergeController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConciergeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices([FromQuery] string? category, CancellationToken ct)
    {
        var services = await _mediator.Send(new GetConciergeServicesQuery(category), ct);
        return Ok(services);
    }

    [HttpGet("reservations")]
    public async Task<IActionResult> GetMyReservations(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var reservations = await _mediator.Send(new GetGuestReservationsQuery(guestId), ct);
        return Ok(reservations);
    }

    [HttpPost("reservations")]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var command = new CreateConciergeReservationCommand(
            request.ServiceId, guestId, request.BookingId, request.ReservedAt);

        var reservation = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetMyReservations), null, reservation);
    }

    [HttpDelete("reservations/{reservationId:guid}")]
    public async Task<IActionResult> CancelReservation(Guid reservationId, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        await _mediator.Send(new CancelConciergeReservationCommand(reservationId, guestId), ct);
        return NoContent();
    }
}
