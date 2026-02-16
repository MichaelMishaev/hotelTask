using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Commands;

public record UpdateRoomStatusCommand(Guid RoomId, string NewStatus) : IRequest<RoomDto>;
