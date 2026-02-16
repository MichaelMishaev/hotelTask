using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Staff.Commands;

public class CheckOutBookingCommandHandler : IRequestHandler<CheckOutBookingCommand, BookingDto>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CheckOutBookingCommandHandler(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IUnitOfWork unitOfWork)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingDto> Handle(CheckOutBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepository.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new NotFoundException("Booking", request.BookingId);

        // Domain method handles status validation and raises domain events
        booking.CheckOut(request.StaffEmail);
        _bookingRepository.Update(booking);

        // Mark the room as available again
        var room = await _roomRepository.GetByIdAsync(booking.RoomId, cancellationToken)
            ?? throw new NotFoundException("Room", booking.RoomId);
        room.MarkAvailable();
        _roomRepository.Update(room);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new BookingDto(
            booking.Id,
            booking.GuestId,
            booking.RoomId,
            booking.Room?.RoomNumber ?? room.RoomNumber,
            booking.Room?.RoomType.ToString() ?? room.RoomType.ToString(),
            booking.DateRange.CheckIn,
            booking.DateRange.CheckOut,
            booking.Status.ToString(),
            booking.TotalAmount.Amount,
            booking.Guest?.FullName ?? "",
            booking.Guest?.Email ?? "");
    }
}
