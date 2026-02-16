using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Profile.Queries;

public record GetGuestProfileQuery(Guid GuestId) : IRequest<GuestProfileDto>;
