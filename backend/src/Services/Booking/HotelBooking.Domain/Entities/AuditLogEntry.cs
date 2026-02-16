namespace HotelBooking.Domain.Entities;

public class AuditLogEntry
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Action { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string UserId { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string? Details { get; init; }
}
