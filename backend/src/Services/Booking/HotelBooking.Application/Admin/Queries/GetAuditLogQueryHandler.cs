using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public class GetAuditLogQueryHandler : IRequestHandler<GetAuditLogQuery, IReadOnlyList<AuditLogDto>>
{
    private readonly IAuditLogRepository _auditLogRepository;

    public GetAuditLogQueryHandler(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<IReadOnlyList<AuditLogDto>> Handle(GetAuditLogQuery request, CancellationToken cancellationToken)
    {
        var entries = await _auditLogRepository.GetRecentAsync(request.Limit, cancellationToken);

        return entries.Select(e => new AuditLogDto(
            e.Id,
            e.Action,
            e.EntityType,
            e.EntityId,
            e.UserId,
            e.Timestamp,
            e.Details
        )).ToList();
    }
}
