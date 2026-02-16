using HotelBooking.Domain.Common;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class GuestProfile : BaseEntity
{
    public Guid GuestId { get; private set; }
    public string Phone { get; private set; } = string.Empty;
    public string Address { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public bool PushNotifications { get; private set; }
    public string Language { get; private set; } = "en";
    public string Currency { get; private set; } = "USD";
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation
    public Guest Guest { get; private set; } = null!;

    // EF Core constructor
    private GuestProfile() { }

    public static GuestProfile Create(Guid guestId)
    {
        return new GuestProfile
        {
            Id = Guid.NewGuid(),
            GuestId = guestId,
            PushNotifications = true,
            Language = "en",
            Currency = "USD",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(string phone, string address, string? avatarUrl,
        bool pushNotifications, string language, string currency)
    {
        if (string.IsNullOrWhiteSpace(language))
            throw new DomainException("Language cannot be empty.");
        if (string.IsNullOrWhiteSpace(currency))
            throw new DomainException("Currency cannot be empty.");

        Phone = phone ?? string.Empty;
        Address = address ?? string.Empty;
        AvatarUrl = avatarUrl;
        PushNotifications = pushNotifications;
        Language = language;
        Currency = currency;
        UpdatedAt = DateTime.UtcNow;
    }
}
