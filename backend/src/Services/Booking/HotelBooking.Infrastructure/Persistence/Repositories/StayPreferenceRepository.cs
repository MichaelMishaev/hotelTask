using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class StayPreferenceRepository : IStayPreferenceRepository
{
    private readonly HotelBookingDbContext _context;

    public StayPreferenceRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<StayPreference?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default)
    {
        return await _context.StayPreferences
            .Include(p => p.Amenities)
            .Include(p => p.Booking)
            .Include(p => p.Guest)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId, ct);
    }

    public async Task<IReadOnlyList<StayPreference>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default)
    {
        return await _context.StayPreferences
            .Include(p => p.Amenities)
            .Include(p => p.Booking)
            .Where(p => p.GuestId == guestId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(StayPreference preference, CancellationToken ct = default)
    {
        await _context.StayPreferences.AddAsync(preference, ct);
    }

    public void Update(StayPreference preference)
    {
        _context.StayPreferences.Update(preference);
    }
}
