using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Services;

public static class PricingCalculator
{
    private static readonly Money PricePerNight = new(100m);

    public static Money Calculate(DateRange dateRange) =>
        new Money(dateRange.Nights * PricePerNight.Amount);
}
