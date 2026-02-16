using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Loyalty.Queries;

public record GetLoyaltyAccountQuery(Guid GuestId) : IRequest<LoyaltyAccountDto>;
