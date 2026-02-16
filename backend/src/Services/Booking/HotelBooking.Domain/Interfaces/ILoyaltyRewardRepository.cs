using HotelBooking.Domain.Entities;

namespace HotelBooking.Domain.Interfaces;

public interface ILoyaltyRewardRepository
{
    Task<LoyaltyReward?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<LoyaltyReward>> GetActiveRewardsAsync(CancellationToken ct = default);
    Task AddAsync(LoyaltyReward reward, CancellationToken ct = default);
    void Update(LoyaltyReward reward);
}
