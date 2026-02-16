using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public record GetTodayCheckInsQuery() : IRequest<IReadOnlyList<CheckInOutDto>>;
