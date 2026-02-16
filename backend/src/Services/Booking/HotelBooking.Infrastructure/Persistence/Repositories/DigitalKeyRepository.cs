using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class DigitalKeyRepository : IDigitalKeyRepository
{
    private readonly HotelBookingDbContext _context;

    public DigitalKeyRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<DigitalKey?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.DigitalKeys
            .Include(k => k.Booking)
            .Include(k => k.Guest)
            .FirstOrDefaultAsync(k => k.Id == id, ct);
    }

    public async Task<DigitalKey?> GetActiveByBookingIdAsync(Guid bookingId, CancellationToken ct = default)
    {
        return await _context.DigitalKeys
            .Include(k => k.Booking)
            .Include(k => k.Guest)
            .FirstOrDefaultAsync(k => k.BookingId == bookingId && k.Status == DigitalKeyStatus.Active, ct);
    }

    public async Task<IReadOnlyList<DigitalKey>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default)
    {
        return await _context.DigitalKeys
            .Include(k => k.Booking)
            .Where(k => k.GuestId == guestId)
            .OrderByDescending(k => k.ActivatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(DigitalKey key, CancellationToken ct = default)
    {
        await _context.DigitalKeys.AddAsync(key, ct);
    }

    public void Update(DigitalKey key)
    {
        _context.DigitalKeys.Update(key);
    }
}
