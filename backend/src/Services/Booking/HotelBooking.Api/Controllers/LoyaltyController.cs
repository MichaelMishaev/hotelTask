using System.Security.Claims;
using HotelBooking.Api.Models;
using HotelBooking.Application.Loyalty.Commands;
using HotelBooking.Application.Loyalty.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoyaltyController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoyaltyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("account")]
    public async Task<IActionResult> GetAccount(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var account = await _mediator.Send(new GetLoyaltyAccountQuery(guestId), ct);
        return Ok(account);
    }

    [HttpGet("rewards")]
    public async Task<IActionResult> GetRewards(CancellationToken ct)
    {
        var rewards = await _mediator.Send(new GetLoyaltyRewardsQuery(), ct);
        return Ok(rewards);
    }

    [HttpPost("redeem")]
    public async Task<IActionResult> RedeemReward([FromBody] RedeemRewardRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (!Guid.TryParse(userId, out var guestId))
            return Forbid();

        var account = await _mediator.Send(new RedeemRewardCommand(guestId, request.RewardId), ct);
        return Ok(account);
    }
}
