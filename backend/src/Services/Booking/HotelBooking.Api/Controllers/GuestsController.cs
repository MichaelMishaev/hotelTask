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

    // guests can only see their own, staff/admin can see anyone's
    [HttpGet("{id:guid}/bookings")]
    public async Task<IActionResult> GetBookings(Guid id, CancellationToken ct)
    {
        // guests can only see their own
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (userRole == "Guest" && !id.ToString().Equals(userId, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var query = new GetGuestBookingsQuery(id);
        var bookings = await _mediator.Send(query, ct);
        return Ok(bookings);
    }
}
