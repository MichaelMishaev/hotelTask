using FluentAssertions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;

namespace HotelBooking.Domain.Tests.Entities;

public class BookingTests
{
    private static DateRange ValidDateRange() =>
        new(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));

    private static Money CalculatePrice(DateRange dateRange) =>
        PricingCalculator.Calculate(dateRange);

    [Fact]
    public void Create_ValidBooking_StatusIsConfirmed()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.Status.Should().Be(BookingStatus.Confirmed);
    }

    [Fact]
    public void Create_ValidBooking_CalculatesTotalFromDateRange()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.TotalAmount.Amount.Should().Be(300m); // 3 nights * $100
    }

    [Fact]
    public void Create_ValidBooking_RaisesDomainEvent()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.DomainEvents.Should().HaveCount(1);
    }

    [Fact]
    public void Cancel_ConfirmedBooking_StatusIsCancelled()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.ClearDomainEvents();

        booking.Cancel("staff@test.com");

        booking.Status.Should().Be(BookingStatus.Cancelled);
    }

    [Fact]
    public void Cancel_ConfirmedBooking_RaisesCancelledEvent()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.ClearDomainEvents();

        booking.Cancel("staff@test.com");

        booking.DomainEvents.Should().NotBeEmpty();
    }

    [Fact]
    public void CheckIn_ConfirmedBooking_StatusIsCheckedIn()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.CheckIn("staff@test.com");
        booking.Status.Should().Be(BookingStatus.CheckedIn);
    }

    [Fact]
    public void CheckOut_CheckedInBooking_StatusIsCheckedOut()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.CheckIn("staff@test.com");
        booking.CheckOut("staff@test.com");
        booking.Status.Should().Be(BookingStatus.CheckedOut);
    }

    // Negative tests - INV-BOOK-003 state machine
    [Fact]
    public void Cancel_AlreadyCancelled_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.Cancel("staff@test.com");
        var act = () => booking.Cancel("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Cancel_CheckedIn_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.CheckIn("staff@test.com");
        var act = () => booking.Cancel("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Cancel_CheckedOut_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.CheckIn("staff@test.com");
        booking.CheckOut("staff@test.com");
        var act = () => booking.Cancel("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void CheckIn_Cancelled_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.Cancel("staff@test.com");
        var act = () => booking.CheckIn("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void CheckIn_AlreadyCheckedIn_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.CheckIn("staff@test.com");
        var act = () => booking.CheckIn("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void CheckOut_Confirmed_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        var act = () => booking.CheckOut("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void CheckOut_Cancelled_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.Cancel("staff@test.com");
        var act = () => booking.CheckOut("staff@test.com");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void CheckOut_AlreadyCheckedOut_ThrowsDomainException()
    {
        var dr = ValidDateRange();
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dr, CalculatePrice(dr), "test@test.com");
        booking.CheckIn("staff@test.com");
        booking.CheckOut("staff@test.com");
        var act = () => booking.CheckOut("staff@test.com");
        act.Should().Throw<DomainException>();
    }
}
