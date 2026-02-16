using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Queries;

public class GetDigitalKeyByBookingQueryHandler : IRequestHandler<GetDigitalKeyByBookingQuery, DigitalKeyDto?>
{
    private readonly IDigitalKeyRepository _keyRepository;

    public GetDigitalKeyByBookingQueryHandler(IDigitalKeyRepository keyRepository)
    {
        _keyRepository = keyRepository;
    }

    public async Task<DigitalKeyDto?> Handle(GetDigitalKeyByBookingQuery request, CancellationToken cancellationToken)
    {
        var key = await _keyRepository.GetActiveByBookingIdAsync(request.BookingId, cancellationToken);
        if (key == null) return null;

        return new DigitalKeyDto(
            key.Id, key.BookingId, key.GuestId,
            key.RoomNumber, key.RoomType.ToString(), key.Floor,
            key.Status.ToString(), key.ActivatedAt, key.ExpiresAt, key.IsValid);
    }
}
