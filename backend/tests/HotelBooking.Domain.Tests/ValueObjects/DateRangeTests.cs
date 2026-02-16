using FluentAssertions;
using HotelBooking.Domain.Exceptions;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Tests.ValueObjects;

public class DateRangeTests
{
    [Fact]
    public void Constructor_ValidDates_CreatesDateRange()
    {
        var checkIn = DateTime.Today.AddDays(1);
        var checkOut = DateTime.Today.AddDays(4);

        var range = new DateRange(checkIn, checkOut);

        range.CheckIn.Should().Be(checkIn);
        range.CheckOut.Should().Be(checkOut);
    }

    [Fact]
    public void Constructor_CheckInAfterCheckOut_ThrowsDomainException()
    {
        var act = () => new DateRange(DateTime.Today.AddDays(5), DateTime.Today.AddDays(2));
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_CheckInEqualsCheckOut_ThrowsDomainException()
    {
        var date = DateTime.Today.AddDays(1);
        var act = () => new DateRange(date, date);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_CheckInInPast_ThrowsDomainException()
    {
        var act = () => new DateRange(DateTime.Today.AddDays(-1), DateTime.Today.AddDays(2));
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Nights_ThreeNightStay_Returns3()
    {
        var range = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        range.Nights.Should().Be(3);
    }

    [Fact]
    public void Overlaps_OverlappingRanges_ReturnsTrue()
    {
        var range1 = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(5));
        var range2 = new DateRange(DateTime.Today.AddDays(3), DateTime.Today.AddDays(7));
        range1.Overlaps(range2).Should().BeTrue();
    }

    [Fact]
    public void Overlaps_NonOverlappingRanges_ReturnsFalse()
    {
        var range1 = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));
        var range2 = new DateRange(DateTime.Today.AddDays(5), DateTime.Today.AddDays(7));
        range1.Overlaps(range2).Should().BeFalse();
    }

    [Fact]
    public void Overlaps_AdjacentRanges_ReturnsFalse()
    {
        var range1 = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));
        var range2 = new DateRange(DateTime.Today.AddDays(3), DateTime.Today.AddDays(5));
        range1.Overlaps(range2).Should().BeFalse();
    }

    [Fact]
    public void Overlaps_SameRange_ReturnsTrue()
    {
        var range1 = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(5));
        var range2 = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(5));
        range1.Overlaps(range2).Should().BeTrue();
    }
}
