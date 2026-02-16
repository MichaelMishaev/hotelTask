using HotelBooking.Application.DTOs;
using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using MediatR;

namespace HotelBooking.Application.Bookings.Queries.GetAvailableRooms;

public class GetAvailableRoomsQueryHandler : IRequestHandler<GetAvailableRoomsQuery, IReadOnlyList<RoomAvailabilityDto>>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IPricingService _pricingService;
    private readonly ICacheService? _cache;

    public GetAvailableRoomsQueryHandler(IRoomRepository roomRepository, IPricingService pricingService, ICacheService? cache = null)
    {
        _roomRepository = roomRepository;
        _pricingService = pricingService;
        _cache = cache;
    }

    public async Task<IReadOnlyList<RoomAvailabilityDto>> Handle(GetAvailableRoomsQuery request, CancellationToken cancellationToken)
    {
        var dateRange = new DateRange(request.CheckIn, request.CheckOut);
        var cacheKey = $"availability:{request.CheckIn:yyyy-MM-dd}:{request.CheckOut:yyyy-MM-dd}:{request.RoomType ?? "all"}:{request.MinPrice?.ToString() ?? "any"}:{request.MaxPrice?.ToString() ?? "any"}";

        // Try cache first
        if (_cache is not null)
        {
            var cached = await _cache.GetAsync<List<RoomAvailabilityDto>>(cacheKey, cancellationToken);
            if (cached is not null) return cached.AsReadOnly();
        }

        var rooms = await _roomRepository.GetAvailableRoomsAsync(dateRange, cancellationToken);

        // Filter by room type if provided
        if (request.RoomType is not null)
        {
            rooms = rooms.Where(r => r.RoomType.ToString() == request.RoomType).ToList();
        }

        // Get pricing per room type (max 3 calls)
        var priceByType = new Dictionary<string, PricingResult>();
        foreach (var type in rooms.Select(r => r.RoomType.ToString()).Distinct())
        {
            priceByType[type] = await _pricingService.CalculatePriceAsync(type, request.CheckIn, request.CheckOut, cancellationToken);
        }

        var result = rooms.Select(r =>
        {
            var pricing = priceByType[r.RoomType.ToString()];
            return new RoomAvailabilityDto(
                r.Id,
                r.RoomNumber,
                r.RoomType.ToString(),
                pricing.PricePerNight,
                pricing.TotalPrice,
                pricing.Nights
            );
        }).ToList();

        // Filter by price range if provided
        if (request.MinPrice.HasValue)
        {
            result = result.Where(r => r.PricePerNight >= request.MinPrice.Value).ToList();
        }
        if (request.MaxPrice.HasValue)
        {
            result = result.Where(r => r.PricePerNight <= request.MaxPrice.Value).ToList();
        }

        // Cache for 5 minutes
        if (_cache is not null)
        {
            await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5), cancellationToken);
        }

        return result.AsReadOnly();
    }
}
