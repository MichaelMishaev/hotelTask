using FluentValidation;

namespace HotelBooking.Application.Bookings.Queries.GetAvailableRooms;

public class GetAvailableRoomsQueryValidator : AbstractValidator<GetAvailableRoomsQuery>
{
    public GetAvailableRoomsQueryValidator()
    {
        RuleFor(x => x.CheckIn)
            .NotEmpty().WithMessage("Check-in date is required.")
            .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Check-in date cannot be in the past.");

        RuleFor(x => x.CheckOut)
            .NotEmpty().WithMessage("Check-out date is required.")
            .GreaterThan(x => x.CheckIn).WithMessage("Check-out date must be after check-in date.");

        When(x => x.RoomType is not null, () =>
        {
            RuleFor(x => x.RoomType)
                .Must(type => type == "Standard" || type == "Deluxe" || type == "Suite")
                .WithMessage("Room type must be one of: Standard, Deluxe, Suite.");
        });

        When(x => x.MinPrice.HasValue, () =>
        {
            RuleFor(x => x.MinPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum price must be greater than or equal to 0.");
        });

        When(x => x.MaxPrice.HasValue, () =>
        {
            RuleFor(x => x.MaxPrice)
                .GreaterThan(0).WithMessage("Maximum price must be greater than 0.");
        });

        When(x => x.MinPrice.HasValue && x.MaxPrice.HasValue, () =>
        {
            RuleFor(x => x.MaxPrice)
                .GreaterThan(x => x.MinPrice).WithMessage("Maximum price must be greater than minimum price.");
        });
    }
}
