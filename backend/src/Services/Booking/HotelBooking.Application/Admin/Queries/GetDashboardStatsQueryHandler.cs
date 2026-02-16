using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IBookingRepository _bookingRepository;

    public GetDashboardStatsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var allBookings = await _bookingRepository.GetAllAsync(cancellationToken);

        var totalBookings = allBookings.Count;
        var activeBookings = allBookings.Count(b =>
            b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.CheckedIn);
        var totalRevenue = allBookings
            .Where(b => b.Status != BookingStatus.Cancelled)
            .Sum(b => b.TotalAmount.Amount);

        // Mock users count (3 hardcoded) + unique guests from bookings
        var uniqueGuests = allBookings.Select(b => b.GuestId).Distinct().Count();
        var totalUsers = Math.Max(uniqueGuests, 3); // At least the 3 mock users

        return new DashboardStatsDto(totalBookings, activeBookings, totalRevenue, totalUsers);
    }
}
