using HotelBooking.Application.DTOs;
using MediatR;

namespace HotelBooking.Application.Concierge.Queries;

public record GetConciergeServicesQuery(string? Category = null) : IRequest<List<ConciergeServiceDto>>;
