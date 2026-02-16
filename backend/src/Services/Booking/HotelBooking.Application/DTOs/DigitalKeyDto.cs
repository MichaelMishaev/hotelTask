namespace HotelBooking.Application.DTOs;

public record DigitalKeyDto(
    Guid Id,
    Guid BookingId,
    Guid GuestId,
    string RoomNumber,
    string RoomType,
    int Floor,
    string Status,
    DateTime? ActivatedAt,
    DateTime ExpiresAt,
    bool IsValid);
