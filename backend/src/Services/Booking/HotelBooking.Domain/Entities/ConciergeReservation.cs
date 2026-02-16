using HotelBooking.Domain.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Entities;

public class ConciergeReservation : BaseEntity
{
    public Guid ServiceId { get; private set; }
    public Guid GuestId { get; private set; }
    public Guid? BookingId { get; private set; }
    public DateTime ReservedAt { get; private set; }
    public ConciergeReservationStatus Status { get; private set; }

    // Navigation
    public ConciergeService Service { get; private set; } = null!;
    public Guest Guest { get; private set; } = null!;
    public Booking? Booking { get; private set; }

    // EF Core constructor
    private ConciergeReservation() { }

    public static ConciergeReservation Create(Guid serviceId, Guid guestId,
        Guid? bookingId, DateTime reservedAt)
    {
        if (reservedAt < DateTime.UtcNow.AddMinutes(-5))
            throw new DomainException("Reservation time cannot be in the past.");

        return new ConciergeReservation
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            GuestId = guestId,
            BookingId = bookingId,
            ReservedAt = reservedAt,
            Status = ConciergeReservationStatus.Pending
        };
    }

    public void Confirm()
    {
        if (Status != ConciergeReservationStatus.Pending)
            throw new DomainException($"Cannot confirm reservation with status {Status}.");

        Status = ConciergeReservationStatus.Confirmed;
    }

    public void Cancel()
    {
        if (Status == ConciergeReservationStatus.Cancelled)
            throw new DomainException("Reservation is already cancelled.");
        if (Status == ConciergeReservationStatus.Completed)
            throw new DomainException("Cannot cancel a completed reservation.");

        Status = ConciergeReservationStatus.Cancelled;
    }

    public void Complete()
    {
        if (Status != ConciergeReservationStatus.Confirmed)
            throw new DomainException($"Cannot complete reservation with status {Status}.");

        Status = ConciergeReservationStatus.Completed;
    }
}
