using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Staff.Commands;

public class UpdateRoomStatusCommandHandler : IRequestHandler<UpdateRoomStatusCommand, RoomDto>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoomStatusCommandHandler(IRoomRepository roomRepository, IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RoomDto> Handle(UpdateRoomStatusCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.RoomId, cancellationToken)
            ?? throw new NotFoundException("Room", request.RoomId);

        if (!Enum.TryParse<RoomStatus>(request.NewStatus, true, out var newStatus))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Status", new[] { $"Invalid room status '{request.NewStatus}'. Valid values: {string.Join(", ", Enum.GetNames<RoomStatus>())}" } }
            });
        }

        // Domain method validates that Occupied can't be set manually
        room.SetStatus(newStatus);
        _roomRepository.Update(room);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RoomDto(
            room.Id,
            room.RoomNumber,
            room.RoomType.ToString(),
            room.Status.ToString());
    }
}
