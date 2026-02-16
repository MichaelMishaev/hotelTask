using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class DigitalKey : BaseEntity
{
    public Guid BookingId { get; private set; }
    public Guid GuestId { get; private set; }
    public string RoomNumber { get; private set; } = string.Empty;
    public RoomType RoomType { get; private set; }
    public int Floor { get; private set; }
    public DigitalKeyStatus Status { get; private set; }
    public DateTime? ActivatedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }

    // Navigation
    public Booking Booking { get; private set; } = null!;
    public Guest Guest { get; private set; } = null!;

    // EF Core constructor
    private DigitalKey() { }

    public static DigitalKey Create(Guid bookingId, Guid guestId,
        string roomNumber, RoomType roomType, int floor, DateTime expiresAt)
    {
        if (string.IsNullOrWhiteSpace(roomNumber))
            throw new DomainException("Room number cannot be empty.");
        if (floor <= 0)
            throw new DomainException("Floor must be a positive number.");
        if (expiresAt <= DateTime.UtcNow)
            throw new DomainException("Expiration date must be in the future.");

        return new DigitalKey
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            GuestId = guestId,
            RoomNumber = roomNumber,
            RoomType = roomType,
            Floor = floor,
            Status = DigitalKeyStatus.Active,
            ActivatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };
    }

    public void Revoke()
    {
        if (Status != DigitalKeyStatus.Active)
            throw new DomainException($"Cannot revoke a key with status {Status}.");

        Status = DigitalKeyStatus.Revoked;
    }

    public void Expire()
    {
        if (Status != DigitalKeyStatus.Active)
            throw new DomainException($"Cannot expire a key with status {Status}.");

        Status = DigitalKeyStatus.Expired;
    }

    public bool IsValid => Status == DigitalKeyStatus.Active && ExpiresAt > DateTime.UtcNow;
}
