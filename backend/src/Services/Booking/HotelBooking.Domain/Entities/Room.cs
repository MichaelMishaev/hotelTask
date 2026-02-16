using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class Room : BaseEntity
{
    public string RoomNumber { get; private set; } = string.Empty;
    public RoomType RoomType { get; private set; }
    public RoomStatus Status { get; private set; }

    // Navigation
    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();

    // EF Core constructor
    private Room() { }

    public Room(string roomNumber, RoomType roomType)
    {
        if (string.IsNullOrWhiteSpace(roomNumber))
            throw new DomainException("Room number cannot be empty.");

        RoomNumber = roomNumber;
        RoomType = roomType;
        Status = RoomStatus.Available;
    }

    public void SetStatus(RoomStatus newStatus)
    {
        if (newStatus == RoomStatus.Occupied)
            throw new DomainException("Room status 'Occupied' is managed automatically by check-in/check-out.");
        Status = newStatus;
    }

    public void MarkOccupied()
    {
        Status = RoomStatus.Occupied;
    }

    public void MarkAvailable()
    {
        Status = RoomStatus.Available;
    }

    // For seeding with known IDs
    public static Room Create(string roomNumber, RoomType roomType)
    {
        return new Room(roomNumber, roomType);
    }
}
