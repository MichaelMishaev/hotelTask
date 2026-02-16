using FluentAssertions;
using HotelBooking.Application.Bookings.Commands.CancelBooking;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Commands;

public class CancelBookingCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly CancelBookingCommandHandler _handler;

    public CancelBookingCommandHandlerTests()
    {
        _handler = new CancelBookingCommandHandler(_bookingRepo.Object, _unitOfWork.Object);
    }

    private static Booking CreateConfirmedBooking()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        return Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dateRange, PricingCalculator.Calculate(dateRange), "test@test.com");
    }

    [Fact]
    public async Task Handle_ConfirmedBooking_CancelsAndReturnsDto()
    {
        var booking = CreateConfirmedBooking();
        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new CancelBookingCommand(booking.Id, "staff@test.com");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.Should().Be("Cancelled");
        _bookingRepo.Verify(b => b.Update(booking), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_BookingNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _bookingRepo.Setup(b => b.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        var command = new CancelBookingCommand(id, "staff@test.com");
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
