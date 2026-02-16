using HotelBooking.Domain.Common;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class LoyaltyReward : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public int PointsCost { get; private set; }
    public bool IsActive { get; private set; }

    // EF Core constructor
    private LoyaltyReward() { }

    public static LoyaltyReward Create(string title, string description,
        string? imageUrl, int pointsCost)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Reward title cannot be empty.");
        if (pointsCost <= 0)
            throw new DomainException("Reward points cost must be positive.");

        return new LoyaltyReward
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description ?? string.Empty,
            ImageUrl = imageUrl,
            PointsCost = pointsCost,
            IsActive = true
        };
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
