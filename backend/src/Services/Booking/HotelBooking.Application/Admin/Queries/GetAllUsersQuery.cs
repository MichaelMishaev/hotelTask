using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public record GetAllUsersQuery(
    string? Search = null,
    string? Role = null,
    int Page = 1,
    int Limit = 20
) : IRequest<PagedResult<UserDto>>;
