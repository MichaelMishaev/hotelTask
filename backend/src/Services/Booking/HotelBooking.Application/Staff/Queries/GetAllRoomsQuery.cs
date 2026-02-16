using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public record GetAllRoomsQuery(string? Status = null) : IRequest<IReadOnlyList<RoomDto>>;
