using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Commands;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
{
    // Mock user IDs for validation
    private static readonly HashSet<string> ValidMockUserIds = new()
    {
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222",
        "33333333-3333-3333-3333-333333333333",
    };

    public Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var userId = request.Id.ToString();

        if (!ValidMockUserIds.Contains(userId))
            throw new NotFoundException("User", request.Id);

        // Demo-only: Return the "updated" user data (mock users can't actually be modified in memory)
        return Task.FromResult(new UserDto(
            userId,
            request.Name,
            request.Email,
            request.Role));
    }
}
