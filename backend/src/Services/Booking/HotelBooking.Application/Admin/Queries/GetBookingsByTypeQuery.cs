using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public record GetBookingsByTypeQuery() : IRequest<BookingsByTypeAnalyticsDto>;
