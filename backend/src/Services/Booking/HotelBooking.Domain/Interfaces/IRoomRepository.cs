using HotelBooking.Domain.Entities;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Interfaces;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Room>> GetAvailableRoomsAsync(DateRange dateRange, CancellationToken ct = default);
    Task<IReadOnlyList<Room>> GetAllAsync(CancellationToken ct = default);
    void Update(Room room);
}
