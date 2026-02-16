using FluentAssertions;
using HotelBooking.Application.Bookings.Queries.GetAvailableRooms;
using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Queries;

public class GetAvailableRoomsQueryHandlerTests
{
    private readonly Mock<IRoomRepository> _roomRepo = new();
    private readonly Mock<IPricingService> _pricingService = new();
    private readonly GetAvailableRoomsQueryHandler _handler;

    public GetAvailableRoomsQueryHandlerTests()
    {
        _handler = new GetAvailableRoomsQueryHandler(_roomRepo.Object, _pricingService.Object);
    }

    [Fact]
    public async Task Handle_RoomsAvailable_ReturnsRoomDtos()
    {
        var checkIn = DateTime.Today.AddDays(1);
        var checkOut = DateTime.Today.AddDays(4);
        var rooms = new List<Room>
        {
            new("101", RoomType.Standard),
            new("201", RoomType.Deluxe)
        };

        _roomRepo.Setup(r => r.GetAvailableRoomsAsync(It.IsAny<DateRange>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(rooms.AsReadOnly());

        _pricingService.Setup(p => p.CalculatePriceAsync("Standard", checkIn, checkOut, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PricingResult(100m, 300m, 3));
        _pricingService.Setup(p => p.CalculatePriceAsync("Deluxe", checkIn, checkOut, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PricingResult(150m, 450m, 3));

        var query = new GetAvailableRoomsQuery(checkIn, checkOut);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().HaveCount(2);
        result[0].RoomNumber.Should().Be("101");
        result[0].PricePerNight.Should().Be(100m);
        result[0].TotalPrice.Should().Be(300m);
        result[0].Nights.Should().Be(3);
        result[1].PricePerNight.Should().Be(150m);
        result[1].TotalPrice.Should().Be(450m);
    }

    [Fact]
    public async Task Handle_NoRoomsAvailable_ReturnsEmptyList()
    {
        _roomRepo.Setup(r => r.GetAvailableRoomsAsync(It.IsAny<DateRange>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Room>().AsReadOnly());

        var query = new GetAvailableRoomsQuery(DateTime.Today.AddDays(1), DateTime.Today.AddDays(2));
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().BeEmpty();
    }
}
