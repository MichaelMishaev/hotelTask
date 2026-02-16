using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class ConciergeServiceRepository : IConciergeServiceRepository
{
    private readonly HotelBookingDbContext _context;

    public ConciergeServiceRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<ConciergeService?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.ConciergeServices.FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<IReadOnlyList<ConciergeService>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.ConciergeServices
            .Where(s => s.IsAvailable)
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Title)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ConciergeService>> GetByCategoryAsync(ConciergeCategory category, CancellationToken ct = default)
    {
        return await _context.ConciergeServices
            .Where(s => s.Category == category && s.IsAvailable)
            .OrderBy(s => s.Title)
            .ToListAsync(ct);
    }

    public async Task AddAsync(ConciergeService service, CancellationToken ct = default)
    {
        await _context.ConciergeServices.AddAsync(service, ct);
    }

    public void Update(ConciergeService service)
    {
        _context.ConciergeServices.Update(service);
    }
}
