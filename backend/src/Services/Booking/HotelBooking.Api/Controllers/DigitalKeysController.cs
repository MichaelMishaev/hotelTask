using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.DigitalKeys.Commands;
using HotelBooking.Application.DigitalKeys.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/digital-keys")]
[Authorize]
public class DigitalKeysController : ControllerBase
{
    private readonly IMediator _mediator;

    public DigitalKeysController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("booking/{bookingId:guid}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId, CancellationToken ct)
    {
        var key = await _mediator.Send(new GetDigitalKeyByBookingQuery(bookingId), ct);
        if (key == null) return NotFound();
        return Ok(key);
    }

    [HttpGet("my-keys")]
    public async Task<IActionResult> GetMyKeys(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var keys = await _mediator.Send(new GetGuestDigitalKeysQuery(guestId), ct);
        return Ok(keys);
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromBody] ActivateDigitalKeyRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var command = new ActivateDigitalKeyCommand(request.BookingId, guestId);
        var key = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetByBooking), new { bookingId = key.BookingId }, key);
    }

    [HttpDelete("{keyId:guid}")]
    public async Task<IActionResult> Revoke(Guid keyId, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        await _mediator.Send(new RevokeDigitalKeyCommand(keyId, guestId), ct);
        return NoContent();
    }
}
