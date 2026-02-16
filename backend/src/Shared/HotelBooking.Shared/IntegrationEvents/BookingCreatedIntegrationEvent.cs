namespace HotelBooking.Shared.IntegrationEvents;

public record BookingCreatedIntegrationEvent(
    Guid BookingId,
    Guid GuestId,
    string GuestEmail,
    string GuestName,
    string RoomNumber,
    string RoomType,
    DateTime CheckIn,
    DateTime CheckOut,
    decimal TotalAmount,
    DateTime OccurredAt);
