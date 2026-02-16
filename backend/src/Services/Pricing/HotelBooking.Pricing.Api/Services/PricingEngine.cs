using HotelBooking.Pricing.Api.Models;

namespace HotelBooking.Pricing.Api.Services;

public class PricingEngine : IPricingEngine
{
    private readonly Dictionary<string, decimal> _baseRates = new()
    {
        { "Standard", 100m },
        { "Deluxe", 150m },
        { "Suite", 250m }
    };

    public PriceCalculationResponse CalculatePrice(PriceCalculationRequest request)
    {
        if (!_baseRates.ContainsKey(request.RoomType))
        {
            throw new ArgumentException($"Unknown room type: {request.RoomType}");
        }

        var baseRate = _baseRates[request.RoomType];
        var breakdown = new List<PriceBreakdownItem>();
        var totalPrice = 0m;
        var currentDate = request.CheckIn;

        while (currentDate < request.CheckOut)
        {
            var seasonMultiplier = GetSeasonMultiplier(currentDate);
            var weekendMultiplier = GetWeekendMultiplier(currentDate);
            var combinedMultiplier = seasonMultiplier * weekendMultiplier;
            var nightRate = baseRate * combinedMultiplier;

            breakdown.Add(new PriceBreakdownItem
            {
                Date = currentDate.ToString("yyyy-MM-dd"),
                Rate = nightRate,
                Multiplier = combinedMultiplier
            });

            totalPrice += nightRate;
            currentDate = currentDate.AddDays(1);
        }

        var nights = (request.CheckOut - request.CheckIn).Days;
        var averagePricePerNight = nights > 0 ? totalPrice / nights : 0m;

        return new PriceCalculationResponse
        {
            RoomType = request.RoomType,
            PricePerNight = averagePricePerNight,
            TotalPrice = totalPrice,
            Nights = nights,
            Breakdown = breakdown
        };
    }

    private decimal GetSeasonMultiplier(DateTime date)
    {
        // Peak season: June-August (6-8) and December (12)
        var month = date.Month;

        if (month >= 6 && month <= 8)
        {
            return 1.25m; // Peak summer season
        }

        if (month == 12)
        {
            return 1.25m; // Peak holiday season
        }

        // Off-peak: January-March (1-3)
        if (month >= 1 && month <= 3)
        {
            return 0.85m;
        }

        // Regular season
        return 1.0m;
    }

    private decimal GetWeekendMultiplier(DateTime date)
    {
        // Weekend surcharge applies to Friday and Saturday nights
        var dayOfWeek = date.DayOfWeek;

        if (dayOfWeek == DayOfWeek.Friday || dayOfWeek == DayOfWeek.Saturday)
        {
            return 1.15m;
        }

        return 1.0m;
    }
}
