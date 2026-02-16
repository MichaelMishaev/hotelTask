using FluentAssertions;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Exceptions;

namespace HotelBooking.Domain.Tests.Entities;

public class GuestTests
{
    [Fact]
    public void Constructor_ValidGuest_CreatesGuest()
    {
        var guest = new Guest("John", "Doe", "john@example.com", "555-0101");
        guest.FirstName.Should().Be("John");
        guest.LastName.Should().Be("Doe");
        guest.Email.Should().Be("john@example.com");
        guest.FullName.Should().Be("John Doe");
    }

    [Fact]
    public void Constructor_EmptyEmail_ThrowsDomainException()
    {
        var act = () => new Guest("John", "Doe", "", "555-0101");
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Constructor_InvalidEmail_ThrowsDomainException()
    {
        var act = () => new Guest("John", "Doe", "invalid-email", "555-0101");
        act.Should().Throw<DomainException>();
    }
}
