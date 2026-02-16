using HotelBooking.Application.Common;
using HotelBooking.Domain.Events;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Shared.IntegrationEvents;
using MediatR;

namespace HotelBooking.Application.EventHandlers;

public class BookingCreatedEventHandler : INotificationHandler<DomainEventNotification<BookingCreatedEvent>>
{
    private readonly IEventPublisher? _publisher;

    public BookingCreatedEventHandler(IEventPublisher? publisher = null)
    {
        _publisher = publisher;
    }

    public async Task Handle(DomainEventNotification<BookingCreatedEvent> notification, CancellationToken cancellationToken)
    {
        if (_publisher is null) return;

        var evt = notification.DomainEvent;
        await _publisher.PublishAsync("hotel.events", "booking.created",
            new BookingCreatedIntegrationEvent(
                evt.BookingId, evt.GuestId, evt.GuestEmail, evt.GuestName,
                evt.RoomNumber, evt.RoomType, evt.CheckIn, evt.CheckOut,
                evt.TotalAmount, DateTime.UtcNow), cancellationToken);
    }
}
