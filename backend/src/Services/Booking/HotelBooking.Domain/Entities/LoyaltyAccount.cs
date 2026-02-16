using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class LoyaltyAccount : BaseEntity
{
    public Guid GuestId { get; private set; }
    public LoyaltyTier Tier { get; private set; }
    public int Points { get; private set; }
    public DateTime MemberSince { get; private set; }

    // Navigation
    public Guest Guest { get; private set; } = null!;
    public ICollection<LoyaltyTransaction> Transactions { get; private set; } = new List<LoyaltyTransaction>();

    // EF Core constructor
    private LoyaltyAccount() { }

    public static LoyaltyAccount Create(Guid guestId)
    {
        return new LoyaltyAccount
        {
            Id = Guid.NewGuid(),
            GuestId = guestId,
            Tier = LoyaltyTier.Silver,
            Points = 0,
            MemberSince = DateTime.UtcNow
        };
    }

    public void EarnPoints(int points, string description)
    {
        if (points <= 0)
            throw new DomainException("Earned points must be positive.");

        Points += points;
        Transactions.Add(LoyaltyTransaction.Create(
            Id, description, points, LoyaltyTransactionType.Earned));

        RecalculateTier();
    }

    public void RedeemPoints(int points, string description)
    {
        if (points <= 0)
            throw new DomainException("Redeemed points must be positive.");
        if (points > Points)
            throw new DomainException("Insufficient points for redemption.");

        Points -= points;
        Transactions.Add(LoyaltyTransaction.Create(
            Id, description, -points, LoyaltyTransactionType.Redeemed));

        RecalculateTier();
    }

    private void RecalculateTier()
    {
        Tier = Points switch
        {
            >= 10000 => LoyaltyTier.Platinum,
            >= 5000 => LoyaltyTier.Gold,
            _ => LoyaltyTier.Silver
        };
    }
}
