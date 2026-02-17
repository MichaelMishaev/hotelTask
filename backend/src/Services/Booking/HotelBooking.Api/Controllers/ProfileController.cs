using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.Profile.Commands;
using HotelBooking.Application.Profile.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{guestId:guid}")]
    public async Task<IActionResult> GetProfile(Guid guestId, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        if (userRole == "Guest" && guestId.ToString() != userId)
            return Forbid();

        var profile = await _mediator.Send(new GetGuestProfileQuery(guestId), ct);
        return Ok(profile);
    }

    [HttpPut("{guestId:guid}")]
    public async Task<IActionResult> UpdateProfile(Guid guestId, [FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        if (userRole == "Guest" && guestId.ToString() != userId)
            return Forbid();

        var command = new UpdateGuestProfileCommand(
            guestId, request.FullName, request.Phone, request.Address, request.AvatarUrl,
            request.PushNotifications, request.Language, request.Currency);

        var profile = await _mediator.Send(command, ct);
        return Ok(profile);
    }
}
