using HotelBooking.Application.DTOs;
using HotelBooking.Domain.Interfaces;
using MediatR;

namespace HotelBooking.Application.Loyalty.Queries;

public class GetLoyaltyRewardsQueryHandler : IRequestHandler<GetLoyaltyRewardsQuery, List<LoyaltyRewardDto>>
{
    private readonly ILoyaltyRewardRepository _rewardRepository;

    public GetLoyaltyRewardsQueryHandler(ILoyaltyRewardRepository rewardRepository)
    {
        _rewardRepository = rewardRepository;
    }

    public async Task<List<LoyaltyRewardDto>> Handle(GetLoyaltyRewardsQuery request, CancellationToken cancellationToken)
    {
        var rewards = await _rewardRepository.GetActiveRewardsAsync(cancellationToken);

        return rewards.Select(r => new LoyaltyRewardDto(
            r.Id, r.Title, r.Description,
            r.ImageUrl, r.PointsCost, r.IsActive)).ToList();
    }
}
