using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.StayPreferences.Commands;

public record SaveStayPreferenceCommand(
    Guid BookingId,
    Guid GuestId,
    string? PillowType,
    string? MinibarPreference,
    string? ArrivalTime,
    List<AmenityInput>? Amenities
) : IRequest<StayPreferenceDto>;

public record AmenityInput(
    string AmenityName,
    string AmenityDescription,
    decimal Price);
