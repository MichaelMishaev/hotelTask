using HotelBooking.Domain.Common;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class StayPreferenceAmenity : BaseEntity
{
    public Guid StayPreferenceId { get; private set; }
    public string AmenityName { get; private set; } = string.Empty;
    public string AmenityDescription { get; private set; } = string.Empty;
    public decimal Price { get; private set; }

    // Navigation
    public StayPreference StayPreference { get; private set; } = null!;

    // EF Core constructor
    private StayPreferenceAmenity() { }

    public static StayPreferenceAmenity Create(Guid stayPreferenceId,
        string amenityName, string amenityDescription, decimal price)
    {
        if (string.IsNullOrWhiteSpace(amenityName))
            throw new DomainException("Amenity name cannot be empty.");
        if (price < 0)
            throw new DomainException("Amenity price cannot be negative.");

        return new StayPreferenceAmenity
        {
            Id = Guid.NewGuid(),
            StayPreferenceId = stayPreferenceId,
            AmenityName = amenityName,
            AmenityDescription = amenityDescription ?? string.Empty,
            Price = price
        };
    }
}
