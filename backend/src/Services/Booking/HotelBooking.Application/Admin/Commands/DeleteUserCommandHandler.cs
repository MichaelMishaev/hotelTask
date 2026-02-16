using HotelBooking.Application.Common.Exceptions;
using MediatR;

namespace HotelBooking.Application.Admin.Commands;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private static readonly HashSet<string> ValidMockUserIds = new()
    {
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222",
        "33333333-3333-3333-3333-333333333333",
    };

    public Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var userId = request.Id.ToString();

        if (!ValidMockUserIds.Contains(userId))
            throw new NotFoundException("User", request.Id);

        // Cannot delete yourself
        if (request.Id == request.CurrentUserId)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Id", new[] { "Cannot delete your own account." } }
            });
        }

        // Demo-only: In a real system this would delete/deactivate the user
        return Task.CompletedTask;
    }
}
