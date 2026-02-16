using HotelBooking.Application.Common;
using HotelBooking.Domain.Common;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Events;
using HotelBooking.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly HotelBookingDbContext _context;
    private readonly IMediator _mediator;

    public UnitOfWork(HotelBookingDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // Collect domain events before saving (entities might get detached after save)
        var domainEvents = CollectDomainEvents();
        var result = await _context.SaveChangesAsync(ct);

        // Write audit log entries from domain events
        await ProcessDomainEventsAsync(domainEvents, ct);

        // Dispatch domain events through MediatR (triggers handlers like RabbitMQ publisher)
        await DispatchDomainEventsAsync(domainEvents, ct);

        return result;
    }

    private List<IDomainEvent> CollectDomainEvents()
    {
        var entities = _context.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var events = entities.SelectMany(e => e.DomainEvents).ToList();
        entities.ForEach(e => e.ClearDomainEvents());

        return events;
    }

    private async Task DispatchDomainEventsAsync(List<IDomainEvent> events, CancellationToken ct)
    {
        foreach (var domainEvent in events)
        {
            var notificationType = typeof(DomainEventNotification<>)
                .MakeGenericType(domainEvent.GetType());
            var notification = Activator.CreateInstance(notificationType, domainEvent)!;
            await _mediator.Publish(notification, ct);
        }
    }

    private async Task ProcessDomainEventsAsync(List<IDomainEvent> events, CancellationToken ct)
    {
        foreach (var domainEvent in events)
        {
            var auditEntry = domainEvent switch
            {
                BookingCreatedEvent e => new AuditLogEntry
                {
                    Action = "BookingCreated",
                    EntityType = "Booking",
                    EntityId = e.BookingId.ToString(),
                    UserId = e.CreatedBy,
                    Details = $"Room {e.RoomId}, CheckIn: {e.CheckIn:yyyy-MM-dd}, CheckOut: {e.CheckOut:yyyy-MM-dd}, Total: ${e.TotalAmount}"
                },
                BookingCancelledEvent e => new AuditLogEntry
                {
                    Action = "BookingCancelled",
                    EntityType = "Booking",
                    EntityId = e.BookingId.ToString(),
                    UserId = e.CancelledBy,
                    Details = e.Reason
                },
                BookingStatusChangedEvent e => new AuditLogEntry
                {
                    Action = "StatusChanged",
                    EntityType = "Booking",
                    EntityId = e.BookingId.ToString(),
                    UserId = e.ChangedBy,
                    Details = $"{e.OldStatus} -> {e.NewStatus}"
                },
                _ => null
            };

            if (auditEntry is not null)
            {
                await _context.AuditLogs.AddAsync(auditEntry, ct);
            }
        }

        if (events.Any())
            await _context.SaveChangesAsync(ct);
    }
}
