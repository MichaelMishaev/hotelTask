using FluentAssertions;
using HotelBooking.Application.Bookings.Commands.CreateBooking;
using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Domain.ValueObjects;
using Moq;

namespace HotelBooking.Application.Tests.Commands;

public class CreateBookingCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IRoomRepository> _roomRepo = new();
    private readonly Mock<IGuestRepository> _guestRepo = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPricingService> _pricingService = new();
    private readonly CreateBookingCommandHandler _handler;

    private static readonly Guid RoomId = Guid.NewGuid();
    private static readonly Guid GuestId = Guid.NewGuid();

    public CreateBookingCommandHandlerTests()
    {
        _handler = new CreateBookingCommandHandler(
            _bookingRepo.Object, _roomRepo.Object, _guestRepo.Object, _unitOfWork.Object, _pricingService.Object);
    }

    private static Room CreateRoom()
    {
        var room = new Room("101", RoomType.Standard);
        // Set Id via reflection since it's set in BaseEntity
        typeof(Room).BaseType!.GetProperty("Id")!.SetValue(room, RoomId);
        return room;
    }

    private static Guest CreateGuest()
    {
        return Guest.Create(GuestId, "John", "Doe", "john@example.com", "555-0101");
    }

    private void SetupPricing(decimal pricePerNight, decimal total, int nights)
    {
        _pricingService.Setup(p => p.CalculatePriceAsync(
            It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PricingResult(pricePerNight, total, nights));
    }

    [Fact]
    public async Task Handle_ValidBooking_ReturnsBookingDto()
    {
        var room = CreateRoom();
        var guest = CreateGuest();
        var checkIn = DateTime.Today.AddDays(1);
        var checkOut = DateTime.Today.AddDays(4);

        _roomRepo.Setup(r => r.GetByIdAsync(RoomId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);
        _bookingRepo.Setup(b => b.HasOverlappingBookingAsync(
            RoomId, It.IsAny<DateRange>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        SetupPricing(100m, 300m, 3);

        var command = new CreateBookingCommand(GuestId, RoomId, checkIn, checkOut);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.GuestId.Should().Be(GuestId);
        result.RoomId.Should().Be(RoomId);
        result.Status.Should().Be("Confirmed");
        result.TotalAmount.Should().Be(300m); // 3 nights * $100
        result.RoomNumber.Should().Be("101");
        result.GuestName.Should().Be("John Doe");
        result.GuestEmail.Should().Be("john@example.com");

        _bookingRepo.Verify(b => b.AddAsync(It.IsAny<Booking>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_RoomNotFound_ThrowsNotFoundException()
    {
        _roomRepo.Setup(r => r.GetByIdAsync(RoomId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room?)null);

        var command = new CreateBookingCommand(GuestId, RoomId, DateTime.Today.AddDays(1), DateTime.Today.AddDays(2));
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_GuestNotFound_ThrowsNotFoundException()
    {
        var room = CreateRoom();
        _roomRepo.Setup(r => r.GetByIdAsync(RoomId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guest?)null);

        var command = new CreateBookingCommand(GuestId, RoomId, DateTime.Today.AddDays(1), DateTime.Today.AddDays(2));
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_OverlappingBooking_ThrowsConflictException()
    {
        var room = CreateRoom();
        var guest = CreateGuest();

        _roomRepo.Setup(r => r.GetByIdAsync(RoomId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);
        _bookingRepo.Setup(b => b.HasOverlappingBookingAsync(
            RoomId, It.IsAny<DateRange>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new CreateBookingCommand(GuestId, RoomId, DateTime.Today.AddDays(1), DateTime.Today.AddDays(4));
        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task Handle_ValidBooking_ServerCalculatesPrice()
    {
        // INV-BOOK-002: Server-authoritative pricing
        var room = CreateRoom();
        var guest = CreateGuest();
        var checkIn = DateTime.Today.AddDays(1);
        var checkOut = DateTime.Today.AddDays(8); // 7 nights

        _roomRepo.Setup(r => r.GetByIdAsync(RoomId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(room);
        _guestRepo.Setup(g => g.GetByIdAsync(GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);
        _bookingRepo.Setup(b => b.HasOverlappingBookingAsync(
            RoomId, It.IsAny<DateRange>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        SetupPricing(100m, 700m, 7);

        var command = new CreateBookingCommand(GuestId, RoomId, checkIn, checkOut);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.TotalAmount.Should().Be(700m); // 7 nights * $100 - server calculated
    }
}
