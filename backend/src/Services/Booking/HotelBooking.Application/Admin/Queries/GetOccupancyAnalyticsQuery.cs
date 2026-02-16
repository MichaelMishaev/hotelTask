using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public record GetOccupancyAnalyticsQuery(string Period = "monthly") : IRequest<OccupancyAnalyticsDto>;
