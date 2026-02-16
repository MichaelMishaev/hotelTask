using HotelBooking.Domain.Common;

namespace HotelBooking.Domain.Events;

public record BookingCreatedEvent(
    Guid BookingId,
    Guid GuestId,
    Guid RoomId,
    DateTime CheckIn,
    DateTime CheckOut,
    decimal TotalAmount,
    string CreatedBy,
    string GuestEmail,
    string GuestName,
    string RoomNumber,
    string RoomType
) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
