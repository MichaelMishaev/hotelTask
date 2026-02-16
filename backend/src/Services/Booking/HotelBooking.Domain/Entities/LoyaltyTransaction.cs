using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class LoyaltyTransaction : BaseEntity
{
    public Guid LoyaltyAccountId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public int Points { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public LoyaltyTransactionType Type { get; private set; }

    // Navigation
    public LoyaltyAccount LoyaltyAccount { get; private set; } = null!;

    // EF Core constructor
    private LoyaltyTransaction() { }

    public static LoyaltyTransaction Create(Guid loyaltyAccountId,
        string description, int points, LoyaltyTransactionType type)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new DomainException("Transaction description cannot be empty.");

        return new LoyaltyTransaction
        {
            Id = Guid.NewGuid(),
            LoyaltyAccountId = loyaltyAccountId,
            Description = description,
            Points = points,
            TransactionDate = DateTime.UtcNow,
            Type = type
        };
    }
}
