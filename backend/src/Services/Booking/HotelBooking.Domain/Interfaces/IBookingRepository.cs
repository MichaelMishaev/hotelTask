using HotelBooking.Domain.Entities;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Interfaces;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Booking>> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default);
    Task<bool> HasOverlappingBookingAsync(Guid roomId, DateRange dateRange, Guid? excludeBookingId = null, CancellationToken ct = default);
    Task AddAsync(Booking booking, CancellationToken ct = default);
    void Update(Booking booking);
    Task<IReadOnlyList<Booking>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Booking>> GetByCheckInDateAsync(DateTime date, CancellationToken ct = default);
    Task<IReadOnlyList<Booking>> GetByCheckOutDateAsync(DateTime date, CancellationToken ct = default);
}
