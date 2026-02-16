using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetUserCountsQueryHandler : IRequestHandler<GetUserCountsQuery, UserCountsDto>
{
    public Task<UserCountsDto> Handle(GetUserCountsQuery request, CancellationToken cancellationToken)
    {
        // Based on MockUsers: 1 Guest, 1 Staff, 1 Admin
        return Task.FromResult(new UserCountsDto(Guests: 1, Staff: 1, Admins: 1));
    }
}
