using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Loyalty.Commands;

public record RedeemRewardCommand(Guid GuestId, Guid RewardId) : IRequest<LoyaltyAccountDto>;
