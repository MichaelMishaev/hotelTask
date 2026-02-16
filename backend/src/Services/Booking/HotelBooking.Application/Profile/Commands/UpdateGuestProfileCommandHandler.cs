using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Profile.Commands;

public class UpdateGuestProfileCommandHandler : IRequestHandler<UpdateGuestProfileCommand, GuestProfileDto>
{
    private readonly IGuestProfileRepository _profileRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateGuestProfileCommandHandler(
        IGuestProfileRepository profileRepository,
        IGuestRepository guestRepository,
        IUnitOfWork unitOfWork)
    {
        _profileRepository = profileRepository;
        _guestRepository = guestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<GuestProfileDto> Handle(UpdateGuestProfileCommand request, CancellationToken cancellationToken)
    {
        var guest = await _guestRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("Guest", request.GuestId);

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            var parts = request.FullName.Trim().Split(' ', 2);
            var firstName = parts[0];
            var lastName = parts.Length > 1 ? parts[1] : firstName;
            guest.UpdateName(firstName, lastName);
        }

        var profile = await _profileRepository.GetByGuestIdAsync(request.GuestId, cancellationToken);

        if (profile == null)
        {
            profile = GuestProfile.Create(request.GuestId);
            profile.Update(request.Phone, request.Address, request.AvatarUrl,
                request.PushNotifications, request.Language, request.Currency);
            await _profileRepository.AddAsync(profile, cancellationToken);
        }
        else
        {
            profile.Update(request.Phone, request.Address, request.AvatarUrl,
                request.PushNotifications, request.Language, request.Currency);
            _profileRepository.Update(profile);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new GuestProfileDto(
            profile.Id, profile.GuestId, guest.FullName, guest.Email,
            profile.Phone, profile.Address, profile.AvatarUrl,
            profile.PushNotifications, profile.Language, profile.Currency,
            profile.CreatedAt, profile.UpdatedAt);
    }
}
