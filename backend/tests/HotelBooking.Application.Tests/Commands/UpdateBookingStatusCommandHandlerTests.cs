using FluentAssertions;
using HotelBooking.Application.Bookings.Commands.UpdateBookingStatus;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Commands;

public class UpdateBookingStatusCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly UpdateBookingStatusCommandHandler _handler;

    public UpdateBookingStatusCommandHandlerTests()
    {
        _handler = new UpdateBookingStatusCommandHandler(_bookingRepo.Object, _unitOfWork.Object);
    }

    private static Booking CreateConfirmedBooking()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        return Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dateRange, PricingCalculator.Calculate(dateRange), "test@test.com");
    }

    [Fact]
    public async Task Handle_CheckIn_ChangesStatusToCheckedIn()
    {
        var booking = CreateConfirmedBooking();
        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new UpdateBookingStatusCommand(booking.Id, "CheckedIn", "staff@test.com");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.Should().Be("CheckedIn");
    }

    [Fact]
    public async Task Handle_CheckOut_ChangesStatusToCheckedOut()
    {
        var booking = CreateConfirmedBooking();
        booking.CheckIn("staff@test.com"); // Must be CheckedIn first

        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new UpdateBookingStatusCommand(booking.Id, "CheckedOut", "staff@test.com");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.Should().Be("CheckedOut");
    }

    [Fact]
    public async Task Handle_Cancel_ChangesStatusToCancelled()
    {
        var booking = CreateConfirmedBooking();
        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new UpdateBookingStatusCommand(booking.Id, "Cancelled", "staff@test.com");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.Should().Be("Cancelled");
    }

    [Fact]
    public async Task Handle_InvalidStatus_ThrowsValidationException()
    {
        var booking = CreateConfirmedBooking();
        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);

        var command = new UpdateBookingStatusCommand(booking.Id, "InvalidStatus", "staff@test.com");
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task Handle_BookingNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _bookingRepo.Setup(b => b.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        var command = new UpdateBookingStatusCommand(id, "CheckedIn", "staff@test.com");
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
