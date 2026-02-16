using FluentValidation;

namespace HotelBooking.Application.Bookings.Commands.UpdateBooking;

public class UpdateBookingCommandValidator : AbstractValidator<UpdateBookingCommand>
{
    public UpdateBookingCommandValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
        RuleFor(x => x.CheckIn).GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Check-in date cannot be in the past.");
        RuleFor(x => x.CheckOut).GreaterThan(x => x.CheckIn)
            .WithMessage("Check-out date must be after check-in date.");
    }
}
