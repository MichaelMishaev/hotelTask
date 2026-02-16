using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Interfaces;

public interface IConciergeServiceRepository
{
    Task<ConciergeService?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ConciergeService>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ConciergeService>> GetByCategoryAsync(ConciergeCategory category, CancellationToken ct = default);
    Task AddAsync(ConciergeService service, CancellationToken ct = default);
    void Update(ConciergeService service);
}
