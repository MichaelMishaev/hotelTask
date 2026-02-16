using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public record GetStaffBookingsQuery(
    string? Status = null,
    string? Search = null,
    int Page = 1,
    int Limit = 20
) : IRequest<PagedResult<BookingDto>>;
