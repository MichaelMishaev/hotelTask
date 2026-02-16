using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.DigitalKeys.Queries;

public class GetGuestDigitalKeysQueryHandler : IRequestHandler<GetGuestDigitalKeysQuery, List<DigitalKeyDto>>
{
    private readonly IDigitalKeyRepository _keyRepository;

    public GetGuestDigitalKeysQueryHandler(IDigitalKeyRepository keyRepository)
    {
        _keyRepository = keyRepository;
    }

    public async Task<List<DigitalKeyDto>> Handle(GetGuestDigitalKeysQuery request, CancellationToken cancellationToken)
    {
        var keys = await _keyRepository.GetByGuestIdAsync(request.GuestId, cancellationToken);

        return keys.Select(k => new DigitalKeyDto(
            k.Id, k.BookingId, k.GuestId,
            k.RoomNumber, k.RoomType.ToString(), k.Floor,
            k.Status.ToString(), k.ActivatedAt, k.ExpiresAt, k.IsValid)).ToList();
    }
}
