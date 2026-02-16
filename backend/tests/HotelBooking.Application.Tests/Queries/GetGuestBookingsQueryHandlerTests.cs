using FluentAssertions;
using HotelBooking.Application.Bookings.Queries.GetGuestBookings;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.Services;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Queries;

public class GetGuestBookingsQueryHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IGuestRepository> _guestRepo = new();
    private readonly GetGuestBookingsQueryHandler _handler;

    private static readonly Guid GuestId = Guid.NewGuid();

    public GetGuestBookingsQueryHandlerTests()
    {
        _handler = new GetGuestBookingsQueryHandler(_bookingRepo.Object, _guestRepo.Object);
    }

    [Fact]
    public async Task Handle_GuestExists_ReturnsBookings()
    {
        var guest = Guest.Create(GuestId, "John", "Doe", "john@example.com", "555-0101");
        var dateRange = new DateRange(DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));
        var bookings = new List<Booking>
        {
            Booking.Create(GuestId, Guid.NewGuid(), dateRange, PricingCalculator.Calculate(dateRange), "john@example.com")
        };

        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);
        _bookingRepo.Setup(b => b.GetByGuestIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookings.AsReadOnly());

        var query = new GetGuestBookingsQuery(GuestId);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].GuestName.Should().Be("John Doe");
        result[0].GuestEmail.Should().Be("john@example.com");
    }

    [Fact]
    public async Task Handle_GuestNotFound_ThrowsNotFoundException()
    {
        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guest?)null);

        var query = new GetGuestBookingsQuery(GuestId);
        var act = () => _handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_GuestWithNoBookings_ReturnsEmptyList()
    {
        var guest = Guest.Create(GuestId, "John", "Doe", "john@example.com", "555-0101");

        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);
        _bookingRepo.Setup(b => b.GetByGuestIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Booking>().AsReadOnly());

        var query = new GetGuestBookingsQuery(GuestId);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().BeEmpty();
    }
}
