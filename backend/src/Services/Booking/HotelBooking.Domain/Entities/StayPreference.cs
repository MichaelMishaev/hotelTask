using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class StayPreference : BaseEntity
{
    public Guid BookingId { get; private set; }
    public Guid GuestId { get; private set; }
    public PillowType? PillowType { get; private set; }
    public MinibarPreference? MinibarPreference { get; private set; }
    public TimeOnly? ArrivalTime { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation
    public Booking Booking { get; private set; } = null!;
    public Guest Guest { get; private set; } = null!;
    public ICollection<StayPreferenceAmenity> Amenities { get; private set; } = new List<StayPreferenceAmenity>();

    // EF Core constructor
    private StayPreference() { }

    public static StayPreference Create(Guid bookingId, Guid guestId,
        PillowType? pillowType, MinibarPreference? minibarPreference, TimeOnly? arrivalTime)
    {
        return new StayPreference
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            GuestId = guestId,
            PillowType = pillowType,
            MinibarPreference = minibarPreference,
            ArrivalTime = arrivalTime,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(PillowType? pillowType, MinibarPreference? minibarPreference, TimeOnly? arrivalTime)
    {
        PillowType = pillowType;
        MinibarPreference = minibarPreference;
        ArrivalTime = arrivalTime;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddAmenity(StayPreferenceAmenity amenity)
    {
        Amenities.Add(amenity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearAmenities()
    {
        Amenities.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}
