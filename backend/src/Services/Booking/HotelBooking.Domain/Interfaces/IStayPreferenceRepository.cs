using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface IStayPreferenceRepository
{
    Task<StayPreference?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task<IReadOnlyList<StayPreference>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default);
    Task AddAsync(StayPreference preference, CancellationToken ct = default);
    void Update(StayPreference preference);
}
