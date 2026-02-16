using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Queries;

public record GetGuestDigitalKeysQuery(Guid GuestId) : IRequest<List<DigitalKeyDto>>;
