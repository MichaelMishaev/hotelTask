namespace HotelBooking.Application.DTOs;

public record RoomAvailabilityDto(
    Guid Id,
    string RoomNumber,
    string RoomType,
    decimal PricePerNight,
    decimal TotalPrice,
    int Nights);
