using HotelBooking.Domain.Common;

namespace HotelBooking.Domain.Events;

public record BookingStatusChangedEvent(
    Guid BookingId,
    string OldStatus,
    string NewStatus,
    string ChangedBy
) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
