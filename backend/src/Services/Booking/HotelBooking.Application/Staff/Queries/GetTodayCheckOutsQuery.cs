using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public record GetTodayCheckOutsQuery() : IRequest<IReadOnlyList<CheckInOutDto>>;
