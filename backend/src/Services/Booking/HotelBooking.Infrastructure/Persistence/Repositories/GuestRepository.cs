using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class GuestRepository : IGuestRepository
{
    private readonly HotelBookingDbContext _context;

    public GuestRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<Guest?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Guests.FirstOrDefaultAsync(g => g.Id == id, ct);
    }

    public async Task<Guest?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _context.Guests.FirstOrDefaultAsync(g => g.Email == email, ct);
    }

    public async Task AddAsync(Guest guest, CancellationToken ct = default)
    {
        await _context.Guests.AddAsync(guest, ct);
    }
}
