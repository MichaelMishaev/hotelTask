namespace HotelBooking.Application.DTOs;

public record ConciergeServiceDto(
    Guid Id,
    string Category,
    string Title,
    string Description,
    decimal Price,
    string? Duration,
    string? Location,
    string? ImageUrl,
    double Rating,
    bool IsAvailable);

public record ConciergeReservationDto(
    Guid Id,
    Guid ServiceId,
    string ServiceTitle,
    string ServiceCategory,
    Guid GuestId,
    Guid? BookingId,
    DateTime ReservedAt,
    string Status,
    decimal ServicePrice);
