namespace HotelBooking.Application.DTOs;

public record LoyaltyAccountDto(
    Guid Id,
    Guid GuestId,
    string GuestName,
    string Tier,
    int Points,
    DateTime MemberSince,
    int NextTierPoints,
    string NextTier,
    List<LoyaltyTransactionDto> RecentTransactions);

public record LoyaltyTransactionDto(
    Guid Id,
    string Description,
    int Points,
    DateTime TransactionDate,
    string Type);

public record LoyaltyRewardDto(
    Guid Id,
    string Title,
    string Description,
    string? ImageUrl,
    int PointsCost,
    bool IsActive);
