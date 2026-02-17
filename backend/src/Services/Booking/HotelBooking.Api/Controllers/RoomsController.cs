using HotelBooking.Application.Bookings.Queries.GetAvailableRooms;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("availability")]
    public async Task<IActionResult> GetAvailability(
        [FromQuery] DateTime checkin,
        [FromQuery] DateTime checkout,
        [FromQuery] string? roomType = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        CancellationToken ct = default)
    {
        var query = new GetAvailableRoomsQuery(checkin, checkout, roomType, minPrice, maxPrice);
        var rooms = await _mediator.Send(query, ct);
        return Ok(rooms);
    }
}
