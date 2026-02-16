using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetRevenueAnalyticsQueryHandler : IRequestHandler<GetRevenueAnalyticsQuery, RevenueAnalyticsDto>
{
    private readonly IBookingRepository _bookingRepository;

    public GetRevenueAnalyticsQueryHandler(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task<RevenueAnalyticsDto> Handle(GetRevenueAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var allBookings = await _bookingRepository.GetAllAsync(cancellationToken);
        var activeBookings = allBookings
            .Where(b => b.Status != BookingStatus.Cancelled)
            .ToList();

        var dataPoints = new List<RevenueDataPoint>();
        var now = DateTime.UtcNow;

        switch (request.Period.ToLower())
        {
            case "daily":
                // Last 30 days
                for (int i = 29; i >= 0; i--)
                {
                    var date = now.AddDays(-i).Date;
                    var revenue = activeBookings
                        .Where(b => b.DateRange.CheckIn.Date <= date && b.DateRange.CheckOut.Date > date)
                        .Sum(b => b.TotalAmount.Amount / (decimal)(b.DateRange.CheckOut - b.DateRange.CheckIn).TotalDays);

                    dataPoints.Add(new RevenueDataPoint(date.ToString("MMM dd"), revenue));
                }
                break;

            case "weekly":
                // Last 12 weeks
                for (int i = 11; i >= 0; i--)
                {
                    var weekStart = now.AddDays(-i * 7 - (int)now.DayOfWeek).Date;
                    var weekEnd = weekStart.AddDays(7);
                    var revenue = activeBookings
                        .Where(b => b.DateRange.CheckIn < weekEnd && b.DateRange.CheckOut > weekStart)
                        .Sum(b =>
                        {
                            var overlapStart = b.DateRange.CheckIn > weekStart ? b.DateRange.CheckIn : weekStart;
                            var overlapEnd = b.DateRange.CheckOut < weekEnd ? b.DateRange.CheckOut : weekEnd;
                            var overlapDays = (overlapEnd - overlapStart).TotalDays;
                            var totalDays = (b.DateRange.CheckOut - b.DateRange.CheckIn).TotalDays;
                            return b.TotalAmount.Amount * (decimal)(overlapDays / totalDays);
                        });

                    dataPoints.Add(new RevenueDataPoint($"Week {12 - i}", revenue));
                }
                break;

            case "monthly":
            default:
                // Last 12 months
                for (int i = 11; i >= 0; i--)
                {
                    var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                    var monthEnd = monthStart.AddMonths(1);
                    var revenue = activeBookings
                        .Where(b => b.DateRange.CheckIn < monthEnd && b.DateRange.CheckOut > monthStart)
                        .Sum(b =>
                        {
                            var overlapStart = b.DateRange.CheckIn > monthStart ? b.DateRange.CheckIn : monthStart;
                            var overlapEnd = b.DateRange.CheckOut < monthEnd ? b.DateRange.CheckOut : monthEnd;
                            var overlapDays = (overlapEnd - overlapStart).TotalDays;
                            var totalDays = (b.DateRange.CheckOut - b.DateRange.CheckIn).TotalDays;
                            return b.TotalAmount.Amount * (decimal)(overlapDays / totalDays);
                        });

                    dataPoints.Add(new RevenueDataPoint(monthStart.ToString("MMM yyyy"), revenue));
                }
                break;
        }

        var totalRevenue = activeBookings.Sum(b => b.TotalAmount.Amount);

        return new RevenueAnalyticsDto(dataPoints, totalRevenue, request.Period.ToLower());
    }
}
