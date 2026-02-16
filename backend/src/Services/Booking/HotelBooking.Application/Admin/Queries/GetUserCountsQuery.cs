using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public record GetUserCountsQuery() : IRequest<UserCountsDto>;
