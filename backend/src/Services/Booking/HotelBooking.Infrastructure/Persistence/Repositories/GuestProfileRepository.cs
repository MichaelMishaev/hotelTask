using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class GuestProfileRepository : IGuestProfileRepository
{
    private readonly HotelBookingDbContext _context;

    public GuestProfileRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<GuestProfile?> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default)
    {
        return await _context.GuestProfiles
            .Include(p => p.Guest)
            .FirstOrDefaultAsync(p => p.GuestId == guestId, ct);
    }

    public async Task AddAsync(GuestProfile profile, CancellationToken ct = default)
    {
        await _context.GuestProfiles.AddAsync(profile, ct);
    }

    public void Update(GuestProfile profile)
    {
        _context.GuestProfiles.Update(profile);
    }
}
