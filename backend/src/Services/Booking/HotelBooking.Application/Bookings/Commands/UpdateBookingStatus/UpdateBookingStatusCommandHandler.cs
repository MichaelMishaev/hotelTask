using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Bookings.Commands.UpdateBookingStatus;

public class UpdateBookingStatusCommandHandler : IRequestHandler<UpdateBookingStatusCommand, BookingDto>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBookingStatusCommandHandler(IBookingRepository bookingRepository, IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingDto> Handle(UpdateBookingStatusCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException("Booking", request.BookingId);

        // Apply the status transition based on the requested status
        switch (request.NewStatus)
        {
            case "CheckedIn":
                booking.CheckIn(request.ChangedBy);
                break;
            case "CheckedOut":
                booking.CheckOut(request.ChangedBy);
                break;
            case "Cancelled":
                booking.Cancel(request.ChangedBy);
                break;
            default:
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    { "Status", new[] { $"Invalid status transition to '{request.NewStatus}'." } }
                });
        }

        _bookingRepository.Update(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new BookingDto(
            booking.Id,
            booking.GuestId,
            booking.RoomId,
            booking.Room?.RoomNumber ?? "",
            booking.Room?.RoomType.ToString() ?? "",
            booking.DateRange.CheckIn,
            booking.DateRange.CheckOut,
            booking.Status.ToString(),
            booking.TotalAmount.Amount,
            booking.Guest?.FullName ?? "",
            booking.Guest?.Email ?? "");
    }
}
