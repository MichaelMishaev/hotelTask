using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Loyalty.Queries;

public record GetLoyaltyRewardsQuery() : IRequest<List<LoyaltyRewardDto>>;
