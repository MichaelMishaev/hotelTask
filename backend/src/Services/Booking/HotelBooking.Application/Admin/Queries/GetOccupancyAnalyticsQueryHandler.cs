using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetOccupancyAnalyticsQueryHandler : IRequestHandler<GetOccupancyAnalyticsQuery, OccupancyAnalyticsDto>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;

    public GetOccupancyAnalyticsQueryHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
    }

    public async Task<OccupancyAnalyticsDto> Handle(GetOccupancyAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var allBookings = await _bookingRepository.GetAllAsync(cancellationToken);
        var activeBookings = allBookings
            .Where(b => b.Status != BookingStatus.Cancelled)
            .ToList();

        var allRooms = await _roomRepository.GetAllAsync(cancellationToken);
        var totalRooms = allRooms.Count;

        var dataPoints = new List<OccupancyDataPoint>();
        var now = DateTime.UtcNow;

        switch (request.Period.ToLower())
        {
            case "daily":
                // Last 30 days
                for (int i = 29; i >= 0; i--)
                {
                    var date = now.AddDays(-i).Date;
                    var occupiedRooms = activeBookings
                        .Where(b => b.DateRange.CheckIn.Date <= date && b.DateRange.CheckOut.Date > date)
                        .Select(b => b.RoomId)
                        .Distinct()
                        .Count();

                    var occupancyRate = totalRooms > 0 ? (double)occupiedRooms / totalRooms * 100 : 0;
                    dataPoints.Add(new OccupancyDataPoint(date.ToString("MMM dd"), occupancyRate));
                }
                break;

            case "weekly":
                // Last 12 weeks
                for (int i = 11; i >= 0; i--)
                {
                    var weekStart = now.AddDays(-i * 7 - (int)now.DayOfWeek).Date;
                    var weekEnd = weekStart.AddDays(7);

                    var totalRoomNights = totalRooms * 7;
                    var occupiedRoomNights = 0;

                    for (var day = weekStart; day < weekEnd; day = day.AddDays(1))
                    {
                        occupiedRoomNights += activeBookings
                            .Where(b => b.DateRange.CheckIn.Date <= day && b.DateRange.CheckOut.Date > day)
                            .Select(b => b.RoomId)
                            .Distinct()
                            .Count();
                    }

                    var occupancyRate = totalRoomNights > 0 ? (double)occupiedRoomNights / totalRoomNights * 100 : 0;
                    dataPoints.Add(new OccupancyDataPoint($"Week {12 - i}", occupancyRate));
                }
                break;

            case "monthly":
            default:
                // Last 12 months
                for (int i = 11; i >= 0; i--)
                {
                    var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                    var monthEnd = monthStart.AddMonths(1);
                    var daysInMonth = (monthEnd - monthStart).Days;

                    var totalRoomNights = totalRooms * daysInMonth;
                    var occupiedRoomNights = 0;

                    for (var day = monthStart; day < monthEnd; day = day.AddDays(1))
                    {
                        occupiedRoomNights += activeBookings
                            .Where(b => b.DateRange.CheckIn.Date <= day && b.DateRange.CheckOut.Date > day)
                            .Select(b => b.RoomId)
                            .Distinct()
                            .Count();
                    }

                    var occupancyRate = totalRoomNights > 0 ? (double)occupiedRoomNights / totalRoomNights * 100 : 0;
                    dataPoints.Add(new OccupancyDataPoint(monthStart.ToString("MMM yyyy"), occupancyRate));
                }
                break;
        }

        var averageOccupancy = dataPoints.Count > 0 ? dataPoints.Average(d => d.OccupancyRate) : 0;

        return new OccupancyAnalyticsDto(dataPoints, averageOccupancy, request.Period.ToLower());
    }
}
