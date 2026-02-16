using FluentAssertions;
using HotelBooking.Domain.Exceptions;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Tests.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Constructor_PositiveAmount_CreatesMoney()
    {
        var money = new Money(100m);
        money.Amount.Should().Be(100m);
    }

    [Fact]
    public void Constructor_ZeroAmount_CreatesMoney()
    {
        var money = new Money(0m);
        money.Amount.Should().Be(0m);
    }

    [Fact]
    public void Constructor_NegativeAmount_ThrowsDomainException()
    {
        var act = () => new Money(-1m);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Add_TwoMoneyValues_ReturnsSumMoney()
    {
        var a = new Money(100m);
        var b = new Money(200m);
        var result = a + b;
        result.Amount.Should().Be(300m);
    }

    [Fact]
    public void Multiply_ByNights_ReturnsCorrectTotal()
    {
        var price = new Money(100m);
        var result = price * 3;
        result.Amount.Should().Be(300m);
    }

    [Fact]
    public void Equals_SameAmount_ReturnsTrue()
    {
        var a = new Money(100m);
        var b = new Money(100m);
        a.Should().Be(b);
    }
}
