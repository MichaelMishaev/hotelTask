using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Concierge.Queries;

public class GetConciergeServicesQueryHandler : IRequestHandler<GetConciergeServicesQuery, List<ConciergeServiceDto>>
{
    private readonly IConciergeServiceRepository _serviceRepository;

    public GetConciergeServicesQueryHandler(IConciergeServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<List<ConciergeServiceDto>> Handle(GetConciergeServicesQuery request, CancellationToken cancellationToken)
    {
        var services = string.IsNullOrEmpty(request.Category)
            ? await _serviceRepository.GetAllAsync(cancellationToken)
            : await _serviceRepository.GetByCategoryAsync(
                Enum.Parse<ConciergeCategory>(request.Category, ignoreCase: true), cancellationToken);

        return services.Select(s => new ConciergeServiceDto(
            s.Id, s.Category.ToString(), s.Title, s.Description,
            s.Price, s.Duration, s.Location, s.ImageUrl,
            s.Rating, s.IsAvailable)).ToList();
    }
}
