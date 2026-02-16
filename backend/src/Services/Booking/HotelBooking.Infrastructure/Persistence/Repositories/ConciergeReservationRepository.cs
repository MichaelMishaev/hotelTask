using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class ConciergeReservationRepository : IConciergeReservationRepository
{
    private readonly HotelBookingDbContext _context;

    public ConciergeReservationRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<ConciergeReservation?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.ConciergeReservations
            .Include(r => r.Service)
            .Include(r => r.Guest)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<IReadOnlyList<ConciergeReservation>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default)
    {
        return await _context.ConciergeReservations
            .Include(r => r.Service)
            .Where(r => r.GuestId == guestId)
            .OrderByDescending(r => r.ReservedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ConciergeReservation>> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default)
    {
        return await _context.ConciergeReservations
            .Include(r => r.Service)
            .Where(r => r.BookingId == bookingId)
            .OrderByDescending(r => r.ReservedAt)
            .ToListAsync(ct);
    }

    public async Task AddAsync(ConciergeReservation reservation, CancellationToken ct = default)
    {
        await _context.ConciergeReservations.AddAsync(reservation, ct);
    }

    public void Update(ConciergeReservation reservation)
    {
        _context.ConciergeReservations.Update(reservation);
    }
}
