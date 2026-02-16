namespace HotelBooking.Application.DTOs;

public record RevenueDataPoint(string Period, decimal Revenue);

public record RevenueAnalyticsDto(
    IReadOnlyList<RevenueDataPoint> Data,
    decimal TotalRevenue,
    string PeriodType);

public record OccupancyDataPoint(string Period, double OccupancyRate);

public record OccupancyAnalyticsDto(
    IReadOnlyList<OccupancyDataPoint> Data,
    double AverageOccupancy,
    string PeriodType);

public record BookingsByTypeDto(string RoomType, int Count, decimal Revenue);

public record BookingsByTypeAnalyticsDto(IReadOnlyList<BookingsByTypeDto> Data);
