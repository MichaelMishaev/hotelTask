using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public record GetRevenueAnalyticsQuery(string Period = "monthly") : IRequest<RevenueAnalyticsDto>;
