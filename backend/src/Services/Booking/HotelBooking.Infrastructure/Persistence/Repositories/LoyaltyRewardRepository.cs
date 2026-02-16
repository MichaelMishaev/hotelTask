using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class LoyaltyRewardRepository : ILoyaltyRewardRepository
{
    private readonly HotelBookingDbContext _context;

    public LoyaltyRewardRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<LoyaltyReward?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.LoyaltyRewards.FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<IReadOnlyList<LoyaltyReward>> GetActiveRewardsAsync(CancellationToken ct = default)
    {
        return await _context.LoyaltyRewards
            .Where(r => r.IsActive)
            .OrderBy(r => r.PointsCost)
            .ToListAsync(ct);
    }

    public async Task AddAsync(LoyaltyReward reward, CancellationToken ct = default)
    {
        await _context.LoyaltyRewards.AddAsync(reward, ct);
    }

    public void Update(LoyaltyReward reward)
    {
        _context.LoyaltyRewards.Update(reward);
    }
}
