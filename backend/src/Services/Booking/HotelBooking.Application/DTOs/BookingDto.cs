namespace HotelBooking.Application.DTOs;

public record BookingDto(
    Guid Id,
    Guid GuestId,
    Guid RoomId,
    string RoomNumber,
    string RoomType,
    DateTime CheckIn,
    DateTime CheckOut,
    string Status,
    decimal TotalAmount,
    string GuestName,
    string GuestEmail);
