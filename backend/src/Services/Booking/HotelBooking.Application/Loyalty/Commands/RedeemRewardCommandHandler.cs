using HotelBooking.Application.Common.Exceptions;
using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Enums;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Loyalty.Commands;

public class RedeemRewardCommandHandler : IRequestHandler<RedeemRewardCommand, LoyaltyAccountDto>
{
    private readonly ILoyaltyAccountRepository _accountRepository;
    private readonly ILoyaltyRewardRepository _rewardRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RedeemRewardCommandHandler(
        ILoyaltyAccountRepository accountRepository,
        ILoyaltyRewardRepository rewardRepository,
        IGuestRepository guestRepository,
        IUnitOfWork unitOfWork)
    {
        _accountRepository = accountRepository;
        _rewardRepository = rewardRepository;
        _guestRepository = guestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoyaltyAccountDto> Handle(RedeemRewardCommand request, CancellationToken cancellationToken)
    {
        var guest = await _guestRepository.GetByIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("Guest", request.GuestId);

        var account = await _accountRepository.GetByGuestIdAsync(request.GuestId, cancellationToken)
            ?? throw new NotFoundException("LoyaltyAccount", request.GuestId);

        var reward = await _rewardRepository.GetByIdAsync(request.RewardId, cancellationToken)
            ?? throw new NotFoundException("LoyaltyReward", request.RewardId);

        account.RedeemPoints(reward.PointsCost, $"Redeemed: {reward.Title}");
        _accountRepository.Update(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
