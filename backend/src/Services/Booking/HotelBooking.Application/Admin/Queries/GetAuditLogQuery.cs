using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Admin.Queries;

public record GetAuditLogQuery(int Limit = 50) : IRequest<IReadOnlyList<AuditLogDto>>;
