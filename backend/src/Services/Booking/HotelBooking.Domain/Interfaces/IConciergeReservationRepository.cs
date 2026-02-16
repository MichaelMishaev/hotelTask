using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface IConciergeReservationRepository
{
    Task<ConciergeReservation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ConciergeReservation>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default);
    Task<IReadOnlyList<ConciergeReservation>> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task AddAsync(ConciergeReservation reservation, CancellationToken ct = default);
    void Update(ConciergeReservation reservation);
}
