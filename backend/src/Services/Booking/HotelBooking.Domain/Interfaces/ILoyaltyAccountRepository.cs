using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface ILoyaltyAccountRepository
{
    Task<LoyaltyAccount?> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default);
    Task AddAsync(LoyaltyAccount account, CancellationToken ct = default);
    void Update(LoyaltyAccount account);
}
