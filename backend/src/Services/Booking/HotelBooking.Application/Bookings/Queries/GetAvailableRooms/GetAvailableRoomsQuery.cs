using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Bookings.Queries.GetAvailableRooms;

public record GetAvailableRoomsQuery(
    DateTime CheckIn,
    DateTime CheckOut,
    string? RoomType = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null
) : IRequest<IReadOnlyList<RoomAvailabilityDto>>;
