using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface IGuestRepository
{
    Task<Guest?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Guest?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task AddAsync(Guest guest, CancellationToken ct = default);
}
