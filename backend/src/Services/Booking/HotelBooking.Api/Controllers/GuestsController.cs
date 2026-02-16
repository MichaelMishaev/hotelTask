using System.Security.Claims;
using HotelBooking.Application.Bookings.Queries.GetGuestBookings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GuestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GuestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all bookings for a guest (INV-RBAC-001: scoped by role)
    /// </summary>
    [HttpGet("{id:guid}/bookings")]
    public async Task<IActionResult> GetBookings(Guid id, CancellationToken ct)
    {
        // INV-RBAC-001: Guests can only view their own bookings
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (userRole == "Guest" && !id.ToString().Equals(userId, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var query = new GetGuestBookingsQuery(id);
        var bookings = await _mediator.Send(query, ct);
        return Ok(bookings);
    }
}
