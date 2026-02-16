using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface IAuditLogRepository
{
    Task AppendAsync(AuditLogEntry entry, CancellationToken ct = default);
    Task<IReadOnlyList<AuditLogEntry>> GetRecentAsync(int limit, CancellationToken ct = default);
    Task<int> GetCountAsync(CancellationToken ct = default);
}
