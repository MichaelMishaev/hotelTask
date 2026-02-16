using FluentAssertions;
using FluentValidation.TestHelper;
using HotelBooking.Application.Bookings.Commands.CreateBooking;

namespace HotelBooking.Application.Tests.Validators;

public class CreateBookingCommandValidatorTests
{
    private readonly CreateBookingCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        var command = new CreateBookingCommand(
            Guid.NewGuid(), Guid.NewGuid(),
            DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyGuestId_FailsValidation()
    {
        var command = new CreateBookingCommand(
            Guid.Empty, Guid.NewGuid(),
            DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.GuestId);
    }

    [Fact]
    public void Validate_EmptyRoomId_FailsValidation()
    {
        var command = new CreateBookingCommand(
            Guid.NewGuid(), Guid.Empty,
            DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.RoomId);
    }

    [Fact]
    public void Validate_PastCheckIn_FailsValidation()
    {
        var command = new CreateBookingCommand(
            Guid.NewGuid(), Guid.NewGuid(),
            DateTime.Today.AddDays(-1), DateTime.Today.AddDays(3));

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CheckIn);
    }

    [Fact]
    public void Validate_CheckOutBeforeCheckIn_FailsValidation()
    {
        var command = new CreateBookingCommand(
            Guid.NewGuid(), Guid.NewGuid(),
            DateTime.Today.AddDays(3), DateTime.Today.AddDays(1));

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CheckOut);
    }

    [Fact]
    public void Validate_SameDayCheckInAndCheckOut_FailsValidation()
    {
        var sameDay = DateTime.Today.AddDays(1);
        var command = new CreateBookingCommand(
            Guid.NewGuid(), Guid.NewGuid(),
            sameDay, sameDay);

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CheckOut);
    }
}
