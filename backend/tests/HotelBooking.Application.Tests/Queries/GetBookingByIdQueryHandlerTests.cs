using FluentAssertions;
using HotelBooking.Application.Bookings.Queries.GetBookingById;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Queries;

public class GetBookingByIdQueryHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly GetBookingByIdQueryHandler _handler;

    public GetBookingByIdQueryHandlerTests()
    {
        _handler = new GetBookingByIdQueryHandler(_bookingRepo.Object);
    }

    [Fact]
    public async Task Handle_ExistingBooking_ReturnsBookingDto()
    {
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), dateRange, PricingCalculator.Calculate(dateRange), "test@test.com");

        _bookingRepo.Setup(b => b.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);

        var query = new GetBookingByIdQuery(booking.Id);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Id.Should().Be(booking.Id);
        result.Status.Should().Be("Confirmed");
        result.TotalAmount.Should().Be(300m);
    }

    [Fact]
    public async Task Handle_NonExistentBooking_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _bookingRepo.Setup(b => b.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        var query = new GetBookingByIdQuery(id);
        var act = () => _handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
