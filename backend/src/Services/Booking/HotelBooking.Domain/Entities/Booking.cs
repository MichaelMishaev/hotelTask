using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Events;
using HotelBooking.Domain.Exceptions;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Entities;

public class Booking : BaseEntity
{
    public Guid GuestId { get; private set; }
    public Guid RoomId { get; private set; }
    public DateRange DateRange { get; private set; } = null!;
    public BookingStatus Status { get; private set; }
    public Money TotalAmount { get; private set; } = null!;

    // Navigation
    public Guest Guest { get; private set; } = null!;
    public Room Room { get; private set; } = null!;

    // EF Core constructor
    private Booking() { }

    public static Booking Create(
        Guid guestId, Guid roomId, DateRange dateRange, Money totalAmount, string createdBy,
        string guestEmail = "", string guestName = "",
        string roomNumber = "", string roomType = "")
    {
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            GuestId = guestId,
            RoomId = roomId,
            DateRange = dateRange,
            Status = BookingStatus.Confirmed,
            TotalAmount = totalAmount
        };

        booking.AddDomainEvent(new BookingCreatedEvent(
            booking.Id, guestId, roomId,
            dateRange.CheckIn, dateRange.CheckOut,
            totalAmount.Amount, createdBy,
            guestEmail, guestName, roomNumber, roomType));

        return booking;
    }

    public void UpdateDates(DateRange newDateRange, Money newTotalAmount)
    {
        if (Status != BookingStatus.Confirmed)
            throw new DomainException($"Cannot update booking with status {Status}. Only Confirmed bookings can be updated.");

        DateRange = newDateRange;
        TotalAmount = newTotalAmount;
    }

    public void Cancel(string cancelledBy)
    {
        if (Status == BookingStatus.Cancelled)
            throw new DomainException("Booking is already cancelled.");
        if (Status != BookingStatus.Confirmed)
            throw new DomainException($"Cannot cancel booking with status {Status}. Only Confirmed bookings can be cancelled.");

        var oldStatus = Status.ToString();
        Status = BookingStatus.Cancelled;
        AddDomainEvent(new BookingCancelledEvent(
            Id, GuestId,
            Guest?.Email ?? "",
            Guest?.FullName ?? "",
            cancelledBy, "Guest requested cancellation"));
        AddDomainEvent(new BookingStatusChangedEvent(Id, oldStatus, Status.ToString(), cancelledBy));
    }

    public void CheckIn(string staffMember)
    {
        if (Status != BookingStatus.Confirmed)
            throw new DomainException($"Cannot check in booking with status {Status}. Only Confirmed bookings can be checked in.");

        var oldStatus = Status.ToString();
        Status = BookingStatus.CheckedIn;
        AddDomainEvent(new BookingStatusChangedEvent(Id, oldStatus, Status.ToString(), staffMember));
    }

    public void CheckOut(string staffMember)
    {
        if (Status != BookingStatus.CheckedIn)
            throw new DomainException($"Cannot check out booking with status {Status}. Only CheckedIn bookings can be checked out.");

        var oldStatus = Status.ToString();
        Status = BookingStatus.CheckedOut;
        AddDomainEvent(new BookingStatusChangedEvent(Id, oldStatus, Status.ToString(), staffMember));
    }
}
