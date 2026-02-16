namespace HotelBooking.Application.DTOs;

public record GuestDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone);
