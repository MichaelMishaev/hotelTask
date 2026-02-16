namespace HotelBooking.Shared.IntegrationEvents;

public record BookingCancelledIntegrationEvent(
    Guid BookingId,
    Guid GuestId,
    string GuestEmail,
    string GuestName,
    DateTime OccurredAt);
