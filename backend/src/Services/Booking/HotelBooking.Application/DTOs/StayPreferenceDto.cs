namespace HotelBooking.Application.DTOs;

public record StayPreferenceDto(
    Guid Id,
    Guid BookingId,
    Guid GuestId,
    string? PillowType,
    string? MinibarPreference,
    string? ArrivalTime,
    List<StayPreferenceAmenityDto> Amenities,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record StayPreferenceAmenityDto(
    Guid Id,
    string AmenityName,
    string AmenityDescription,
    decimal Price);
