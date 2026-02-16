using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class ConciergeService : BaseEntity
{
    public ConciergeCategory Category { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string? Duration { get; private set; }
    public string? Location { get; private set; }
    public string? ImageUrl { get; private set; }
    public double Rating { get; private set; }
    public bool IsAvailable { get; private set; }

    // Navigation
    public ICollection<ConciergeReservation> Reservations { get; private set; } = new List<ConciergeReservation>();

    // EF Core constructor
    private ConciergeService() { }

    public static ConciergeService Create(ConciergeCategory category, string title,
        string description, decimal price, string? duration, string? location,
        string? imageUrl, double rating)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Service title cannot be empty.");
        if (price < 0)
            throw new DomainException("Service price cannot be negative.");
        if (rating < 0 || rating > 5)
            throw new DomainException("Service rating must be between 0 and 5.");

        return new ConciergeService
        {
            Id = Guid.NewGuid(),
            Category = category,
            Title = title,
            Description = description ?? string.Empty,
            Price = price,
            Duration = duration,
            Location = location,
            ImageUrl = imageUrl,
            Rating = rating,
            IsAvailable = true
        };
    }

    public void SetAvailability(bool isAvailable) => IsAvailable = isAvailable;
}
