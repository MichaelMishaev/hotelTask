using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.StayPreferences.Commands;
using HotelBooking.Application.StayPreferences.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/stay-preferences")]
[Authorize]
public class StayPreferencesController : ControllerBase
{
    private readonly IMediator _mediator;

    public StayPreferencesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("booking/{bookingId:guid}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId, CancellationToken ct)
    {
        var pref = await _mediator.Send(new GetStayPreferenceByBookingQuery(bookingId), ct);
        if (pref == null) return NotFound();
        return Ok(pref);
    }

    // upsert - creates or updates preferences for the given booking
    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveStayPreferenceRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var amenities = request.Amenities?.Select(a =>
            new AmenityInput(a.AmenityName, a.AmenityDescription, a.Price)).ToList();

        var command = new SaveStayPreferenceCommand(
            request.BookingId, guestId,
            request.PillowType, request.MinibarPreference,
            request.ArrivalTime, amenities);

        var pref = await _mediator.Send(command, ct);
        return Ok(pref);
    }
}
