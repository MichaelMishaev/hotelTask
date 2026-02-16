using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly HotelBookingDbContext _context;

    public BookingRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<Domain.Entities.Booking?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.Guest)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
    }

    public async Task<IReadOnlyList<Domain.Entities.Booking>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.Guest)
            .Where(b => b.GuestId == guestId)
            .OrderByDescending(b => b.DateRange.CheckIn)
            .ToListAsync(ct);
    }

    public async Task<bool> HasOverlappingBookingAsync(
        Guid roomId, DateRange dateRange, Guid? excludeBookingId = null, CancellationToken ct = default)
    {
        var query = _context.Bookings
            .Where(b => b.RoomId == roomId)
            .Where(b => b.Status != Domain.Enums.BookingStatus.Cancelled);

        if (excludeBookingId.HasValue)
            query = query.Where(b => b.Id != excludeBookingId.Value);

        // overlap: checkIn < other.checkOut AND other.checkIn < checkOut
        return await query.AnyAsync(b =>
            dateRange.CheckIn < b.DateRange.CheckOut &&
            b.DateRange.CheckIn < dateRange.CheckOut, ct);
    }

    public async Task AddAsync(Domain.Entities.Booking booking, CancellationToken ct = default)
    {
        await _context.Bookings.AddAsync(booking, ct);
    }

    public void Update(Domain.Entities.Booking booking)
    {
        _context.Bookings.Update(booking);
    }

    public async Task<IReadOnlyList<Domain.Entities.Booking>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.Guest)
            .OrderByDescending(b => b.DateRange.CheckIn)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Domain.Entities.Booking>> GetByCheckInDateAsync(DateTime date, CancellationToken ct = default)
    {
        var dateOnly = date.Date;
        return await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.Guest)
            .Where(b => b.DateRange.CheckIn.Date == dateOnly)
            .Where(b => b.Status != Domain.Enums.BookingStatus.Cancelled)
            .OrderBy(b => b.DateRange.CheckIn)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Domain.Entities.Booking>> GetByCheckOutDateAsync(DateTime date, CancellationToken ct = default)
    {
        var dateOnly = date.Date;
        return await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.Guest)
            .Where(b => b.DateRange.CheckOut.Date == dateOnly)
            .Where(b => b.Status != Domain.Enums.BookingStatus.Cancelled)
            .OrderBy(b => b.DateRange.CheckOut)
            .ToListAsync(ct);
    }
}
