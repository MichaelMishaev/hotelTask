using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface IDigitalKeyRepository
{
    Task<DigitalKey?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<DigitalKey?> GetActiveByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task<IReadOnlyList<DigitalKey>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default);
    Task AddAsync(DigitalKey key, CancellationToken ct = default);
    void Update(DigitalKey key);
}
