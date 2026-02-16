using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly HotelBookingDbContext _context;

    public RoomRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<Room?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<IReadOnlyList<Room>> GetAvailableRoomsAsync(DateRange dateRange, CancellationToken ct = default)
    {
        // A room is available if it has no active bookings that overlap the requested date range
        var bookedRoomIds = await _context.Bookings
            .Where(b => b.Status != BookingStatus.Cancelled)
            .Where(b => dateRange.CheckIn < b.DateRange.CheckOut && b.DateRange.CheckIn < dateRange.CheckOut)
            .Select(b => b.RoomId)
            .Distinct()
            .ToListAsync(ct);

        return await _context.Rooms
            .Where(r => r.Status == RoomStatus.Available)
            .Where(r => !bookedRoomIds.Contains(r.Id))
            .OrderBy(r => r.RoomType)
            .ThenBy(r => r.RoomNumber)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Room>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Rooms
            .OrderBy(r => r.RoomType)
            .ThenBy(r => r.RoomNumber)
            .ToListAsync(ct);
    }

    public void Update(Room room)
    {
        _context.Rooms.Update(room);
    }
}
