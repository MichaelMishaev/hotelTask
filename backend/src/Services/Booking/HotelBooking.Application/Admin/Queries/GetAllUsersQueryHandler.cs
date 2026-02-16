using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserDto>>
{
    // Using MockUsers data directly since we don't have a real Users table
    private static readonly List<UserDto> MockUserList = new()
    {
        new UserDto("11111111-1111-1111-1111-111111111111", "John Doe", "john@example.com", "Guest"),
        new UserDto("22222222-2222-2222-2222-222222222222", "Jane Smith", "jane@example.com", "Staff"),
        new UserDto("33333333-3333-3333-3333-333333333333", "Admin User", "admin@example.com", "Admin"),
    };

    public Task<PagedResult<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<UserDto> users = MockUserList;

        // Filter by role
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            users = users.Where(u => u.Role.Equals(request.Role, StringComparison.OrdinalIgnoreCase));
        }

        // Filter by search
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            users = users.Where(u =>
                u.Name.ToLowerInvariant().Contains(search) ||
                u.Email.ToLowerInvariant().Contains(search));
        }

        var filtered = users.ToList();
        var total = filtered.Count;
        var paged = filtered
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .ToList();

        return Task.FromResult(new PagedResult<UserDto>(paged, total, request.Page, request.Limit));
    }
}
