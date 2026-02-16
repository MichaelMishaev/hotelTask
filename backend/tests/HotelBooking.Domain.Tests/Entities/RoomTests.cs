using FluentAssertions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Tests.Entities;

public class RoomTests
{
    [Fact]
    public void Constructor_ValidRoom_CreatesRoom()
    {
        var room = new Room("101", RoomType.Standard);
        room.RoomNumber.Should().Be("101");
        room.RoomType.Should().Be(RoomType.Standard);
        room.Status.Should().Be(RoomStatus.Available);
    }

    [Fact]
    public void Constructor_InvalidRoomNumber_ThrowsDomainException()
    {
        var act = () => new Room("", RoomType.Standard);
        act.Should().Throw<DomainException>();
    }
}
