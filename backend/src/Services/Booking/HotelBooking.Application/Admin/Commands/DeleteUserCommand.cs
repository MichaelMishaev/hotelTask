using MediatR;

namespace HotelBooking.Application.Admin.Commands;

public record DeleteUserCommand(Guid Id, Guid CurrentUserId) : IRequest;
