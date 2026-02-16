using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence.Repositories;

public class LoyaltyAccountRepository : ILoyaltyAccountRepository
{
    private readonly HotelBookingDbContext _context;

    public LoyaltyAccountRepository(HotelBookingDbContext context)
    {
        _context = context;
    }

    public async Task<LoyaltyAccount?> GetByGuestIdAsync(Guid guestId, CancellationToken ct = default)
    {
        return await _context.LoyaltyAccounts
            .Include(a => a.Guest)
            .Include(a => a.Transactions.OrderByDescending(t => t.TransactionDate))
            .FirstOrDefaultAsync(a => a.GuestId == guestId, ct);
    }

    public async Task AddAsync(LoyaltyAccount account, CancellationToken ct = default)
    {
        await _context.LoyaltyAccounts.AddAsync(account, ct);
    }

    public void Update(LoyaltyAccount account)
    {
        _context.LoyaltyAccounts.Update(account);
    }
}
