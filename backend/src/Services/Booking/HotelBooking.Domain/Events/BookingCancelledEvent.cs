using HotelBooking.Domain.Common;

namespace HotelBooking.Domain.Events;

public record BookingCancelledEvent(
    Guid BookingId,
    Guid GuestId,
    string GuestEmail,
    string GuestName,
    string CancelledBy,
    string Reason
) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
