using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Concierge.Commands;

public record CreateConciergeReservationCommand(
    Guid ServiceId,
    Guid GuestId,
    Guid? BookingId,
    DateTime ReservedAt
) : IRequest<ConciergeReservationDto>;
