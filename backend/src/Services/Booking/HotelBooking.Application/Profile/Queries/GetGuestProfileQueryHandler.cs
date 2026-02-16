using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Profile.Queries;

public class GetGuestProfileQueryHandler : IRequestHandler<GetGuestProfileQuery, GuestProfileDto>
{
    private readonly IGuestProfileRepository _profileRepository;
    private readonly IGuestRepository _guestRepository;

    public GetGuestProfileQueryHandler(
        IGuestProfileRepository profileRepository,
        IGuestRepository guestRepository)
    {
        _profileRepository = profileRepository;
        _guestRepository = guestRepository;
    }

    public async Task<GuestProfileDto> Handle(GetGuestProfileQuery request, CancellationToken cancellationToken)
    {
        var guest = await _guestRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("Guest", request.GuestId);

        var profile = await _profileRepository.GetByGuestIdAsync(request.GuestId, cancellationToken);

        if (profile == null)
        {
            return new GuestProfileDto(
                Guid.Empty, guest.Id, guest.FullName, guest.Email,
                guest.Phone, string.Empty, null, true, "en", "USD",
                DateTime.UtcNow, DateTime.UtcNow);
        }

        return new GuestProfileDto(
            profile.Id, profile.GuestId, guest.FullName, guest.Email,
            profile.Phone, profile.Address, profile.AvatarUrl,
            profile.PushNotifications, profile.Language, profile.Currency,
            profile.CreatedAt, profile.UpdatedAt);
    }
}
