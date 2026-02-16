using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface IGuestProfileRepository
{
    Task<GuestProfile?> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default);
    Task AddAsync(GuestProfile profile, CancellationToken ct = default);
    void Update(GuestProfile profile);
}
