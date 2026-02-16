using System.Net.Http.Json;
using HotelBooking.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace HotelBooking.Infrastructure.Pricing;

public class HttpPricingService : IPricingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HttpPricingService> _logger;
    private const decimal FallbackPricePerNight = 100m;

    public HttpPricingService(HttpClient httpClient, ILogger<HttpPricingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PricingResult> CalculatePriceAsync(string roomType, DateTime checkIn, DateTime checkOut, CancellationToken ct = default)
    {
        try
        {
            var url = $"/api/pricing/calculate?roomType={Uri.EscapeDataString(roomType)}&checkin={checkIn:yyyy-MM-dd}&checkout={checkOut:yyyy-MM-dd}";
            var response = await _httpClient.GetFromJsonAsync<PricingApiResponse>(url, ct);

            if (response is not null)
                return new PricingResult(response.PricePerNight, response.TotalPrice, response.Nights);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Pricing service unavailable, falling back to static pricing for {RoomType}", roomType);
        }

        // Fallback to static pricing
        var nights = (int)(checkOut.Date - checkIn.Date).TotalDays;
        return new PricingResult(FallbackPricePerNight, FallbackPricePerNight * nights, nights);
    }

    private record PricingApiResponse(decimal PricePerNight, decimal TotalPrice, int Nights);
}
