using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Concierge.Queries;

public class GetGuestReservationsQueryHandler : IRequestHandler<GetGuestReservationsQuery, List<ConciergeReservationDto>>
{
    private readonly IConciergeReservationRepository _reservationRepository;

    public GetGuestReservationsQueryHandler(IConciergeReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<List<ConciergeReservationDto>> Handle(GetGuestReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _reservationRepository.GetByGuestIdAsync(request.GuestId, cancellationToken);

        return reservations.Select(r => new ConciergeReservationDto(
            r.Id, r.ServiceId, r.Service?.Title ?? string.Empty,
            r.Service?.Category.ToString() ?? string.Empty,
            r.GuestId, r.BookingId, r.ReservedAt,
            r.Status.ToString(), r.Service?.Price ?? 0)).ToList();
    }
}
