using FluentAssertions;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Tests.Services;

public class PricingCalculatorTests
{
    [Fact]
    public void Calculate_ThreeNightStay_Returns300()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        var result = PricingCalculator.Calculate(dateRange);
        result.Amount.Should().Be(300m);
    }

    [Fact]
    public void Calculate_OneNightStay_Returns100()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(2));
        var result = PricingCalculator.Calculate(dateRange);
        result.Amount.Should().Be(100m);
    }

    [Fact]
    public void Calculate_SevenNightStay_Returns700()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(8));
        var result = PricingCalculator.Calculate(dateRange);
        result.Amount.Should().Be(700m);
    }
}
