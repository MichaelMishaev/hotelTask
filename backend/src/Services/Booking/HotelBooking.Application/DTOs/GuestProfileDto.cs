namespace HotelBooking.Application.DTOs;

public record GuestProfileDto(
    Guid Id,
    Guid GuestId,
    string GuestName,
    string Email,
    string Phone,
    string Address,
    string? AvatarUrl,
    bool PushNotifications,
    string Language,
    string Currency,
    DateTime CreatedAt,
    DateTime UpdatedAt);
