namespace HotelBooking.Application.DTOs;

public record RoomDto(Guid Id, string RoomNumber, string RoomType, string Status);

public record CheckInOutDto(
    Guid BookingId,
    string GuestName,
    string RoomNumber,
    string RoomType,
    DateTime CheckIn,
    DateTime CheckOut,
    string Status);

public record DashboardStatsDto(
    int TotalBookings,
    int ActiveBookings,
    decimal TotalRevenue,
    int TotalUsers);

public record UserCountsDto(int Guests, int Staff, int Admins);

public record AuditLogDto(
    Guid Id,
    string Action,
    string EntityType,
    string EntityId,
    string UserId,
    DateTime Timestamp,
    string? Details);

public record UserDto(string Id, string Name, string Email, string Role);

public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int Limit);
