using FluentAssertions;
using HotelBooking.Application.Bookings.Commands.UpdateBooking;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Commands;

public class UpdateBookingCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPricingService> _pricingService = new();
    private readonly UpdateBookingCommandHandler _handler;

    public UpdateBookingCommandHandlerTests()
    {
        _handler = new UpdateBookingCommandHandler(_bookingRepo.Object, _unitOfWork.Object, _pricingService.Object);
    }

    private static Booking CreateConfirmedBooking()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        return Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dateRange, PricingCalculator.Calculate(dateRange), "test@test.com");
    }

    private void SetupPricing(decimal pricePerNight, decimal total, int nights)
    {
        _pricingService.Setup(p => p.CalculatePriceAsync(
            It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PricingResult(pricePerNight, total, nights));
    }

    [Fact]
    public async Task Handle_ValidUpdate_UpdatesDatesAndReturnsDto()
    {
        var booking = CreateConfirmedBooking();
        var newCheckIn = DateTime.Today.AddDays(2);
        var newCheckOut = DateTime.Today.AddDays(6); // 4 nights

        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _bookingRepo.Setup(b => b.HasOverlappingBookingAsync(
            booking.RoomId, It.IsAny<DateRange>(), booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        SetupPricing(100m, 400m, 4);

        var command = new UpdateBookingCommand(booking.Id, newCheckIn, newCheckOut, "staff@test.com");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.TotalAmount.Should().Be(400m); // 4 nights * $100 - recalculated
        result.CheckIn.Should().Be(newCheckIn);
        result.CheckOut.Should().Be(newCheckOut);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_BookingNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _bookingRepo.Setup(b => b.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        var command = new UpdateBookingCommand(id, DateTime.Today.AddDays(2), DateTime.Today.AddDays(5), "staff@test.com");
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_OverlappingDates_ThrowsConflictException()
    {
        var booking = CreateConfirmedBooking();

        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _bookingRepo.Setup(b => b.HasOverlappingBookingAsync(
            booking.RoomId, It.IsAny<DateRange>(), booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new UpdateBookingCommand(booking.Id, DateTime.Today.AddDays(2), DateTime.Today.AddDays(5), "staff@test.com");
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }
}
