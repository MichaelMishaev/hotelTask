using HotelBooking.Application.Common;
using HotelBooking.Domain.Events;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Shared.IntegrationEvents;
using MediatR;

namespace HotelBooking.Application.EventHandlers;

public class BookingCancelledEventHandler : INotificationHandler<DomainEventNotification<BookingCancelledEvent>>
{
    private readonly IEventPublisher? _publisher;

    public BookingCancelledEventHandler(IEventPublisher? publisher = null)
    {
        _publisher = publisher;
    }

    public async Task Handle(DomainEventNotification<BookingCancelledEvent> notification, CancellationToken cancellationToken)
    {
        if (_publisher is null) return;

        var evt = notification.DomainEvent;
        await _publisher.PublishAsync("hotel.events", "booking.cancelled",
            new BookingCancelledIntegrationEvent(
                evt.BookingId, evt.GuestId, evt.GuestEmail, evt.GuestName,
                DateTime.UtcNow), cancellationToken);
    }
}
