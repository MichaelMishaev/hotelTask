using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Concierge.Queries;

public record GetGuestReservationsQuery(Guid GuestId) : IRequest<List<ConciergeReservationDto>>;
