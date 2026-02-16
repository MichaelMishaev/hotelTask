using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly HotelBookingDbContext _context;

    public AuditLogRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task AppendAsync(AuditLogEntry entry, CancellationToken ct = default)
    {
        await _context.AuditLogs.AddAsync(entry, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<AuditLogEntry>> GetRecentAsync(int limit, CancellationToken ct = default)
    {
        return await _context.AuditLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToListAsync(ct);
    }

    public async Task<int> GetCountAsync(CancellationToken ct = default)
    {
        return await _context.AuditLogs.CountAsync(ct);
    }
}
