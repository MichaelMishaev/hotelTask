using MediatR;

namespace HotelBooking.Application.Concierge.Commands;

public record CancelConciergeReservationCommand(Guid ReservationId, Guid GuestId) : IRequest<Unit>;
