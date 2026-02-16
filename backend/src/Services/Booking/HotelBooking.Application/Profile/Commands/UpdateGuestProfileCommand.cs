using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Profile.Commands;

public record UpdateGuestProfileCommand(
    Guid GuestId,
    string? FullName,
    string Phone,
    string Address,
    string? AvatarUrl,
    bool PushNotifications,
    string Language,
    string Currency
) : IRequest<GuestProfileDto>;
