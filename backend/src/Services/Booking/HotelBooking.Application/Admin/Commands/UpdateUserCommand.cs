using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Commands;

public record UpdateUserCommand(Guid Id, string Name, string Email, string Role) : IRequest<UserDto>;
