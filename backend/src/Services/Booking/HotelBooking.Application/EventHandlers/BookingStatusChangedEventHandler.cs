using HotelBooking.Application.Common;
using HotelBooking.Domain.Events;
using MediatR;

namespace HotelBooking.Application.EventHandlers;

public class BookingStatusChangedEventHandler : INotificationHandler<DomainEventNotification<BookingStatusChangedEvent>>
{
    public Task Handle(DomainEventNotification<BookingStatusChangedEvent> notification, CancellationToken cancellationToken)
    {
        // Audit logging is handled by UnitOfWork.ProcessDomainEventsAsync
        // Add integration event publishing here if needed in the future
        return Task.CompletedTask;
    }
}
