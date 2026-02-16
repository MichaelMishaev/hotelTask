using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Staff.Queries;

public class GetAllRoomsQueryHandler : IRequestHandler<GetAllRoomsQuery, IReadOnlyList<RoomDto>>
{
    private readonly IRoomRepository _roomRepository;

    public GetAllRoomsQueryHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<IReadOnlyList<RoomDto>> Handle(GetAllRoomsQuery request, CancellationToken cancellationToken)
    {
        var rooms = await _roomRepository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            rooms = rooms
                .Where(r => r.Status.ToString().Equals(request.Status, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        return rooms.Select(r => new RoomDto(
            r.Id,
            r.RoomNumber,
            r.RoomType.ToString(),
            r.Status.ToString()
        )).ToList();
    }
}
