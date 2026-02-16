using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Loyalty.Queries;

public class GetLoyaltyAccountQueryHandler : IRequestHandler<GetLoyaltyAccountQuery, LoyaltyAccountDto>
{
    private readonly ILoyaltyAccountRepository _accountRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetLoyaltyAccountQueryHandler(
        ILoyaltyAccountRepository accountRepository,
        IGuestRepository guestRepository,
        IUnitOfWork unitOfWork)
    {
        _accountRepository = accountRepository;
        _guestRepository = guestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoyaltyAccountDto> Handle(GetLoyaltyAccountQuery request, CancellationToken cancellationToken)
    {
        var guest = await _guestRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("Guest", request.GuestId);

        var account = await _accountRepository.GetByGuestIdAsync(request.GuestId, cancellationToken);

        if (account == null)
        {
            // Auto-create loyalty account for guest
            account = LoyaltyAccount.Create(request.GuestId);
            await _accountRepository.AddAsync(account, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var (nextTierPoints, nextTier) = account.Tier switch
        {
            LoyaltyTier.Silver => (5000 - account.Points, "Gold"),
            LoyaltyTier.Gold => (10000 - account.Points, "Platinum"),
            LoyaltyTier.Platinum => (0, "Platinum"),
            _ => (5000, "Gold")
        };

        return new LoyaltyAccountDto(
            account.Id, account.GuestId, guest.FullName,
            account.Tier.ToString(), account.Points, account.MemberSince,
            Math.Max(0, nextTierPoints), nextTier,
            account.Transactions.Select(t => new LoyaltyTransactionDto(
                t.Id, t.Description, t.Points,
                t.TransactionDate, t.Type.ToString())).ToList());
    }
}
