using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HotelBooking.Infrastructure.Persistence;

public static class SeedData
{
    // Fixed GUIDs so frontend can reference them for demo login
    public static readonly Guid GuestUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid StaffUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HotelBookingDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<HotelBookingDbContext>>();

        try
        {
            await context.Database.EnsureCreatedAsync();

            if (await context.Rooms.AnyAsync())
            {
                logger.LogInformation("Database already seeded, skipping.");
                return;
            }

            logger.LogInformation("Seeding database...");

            // Seed rooms - 3 of each type for the Grand Hotel
            var rooms = new[]
            {
                Room.Create("101", RoomType.Standard),
                Room.Create("102", RoomType.Standard),
                Room.Create("103", RoomType.Standard),
                Room.Create("201", RoomType.Deluxe),
                Room.Create("202", RoomType.Deluxe),
                Room.Create("203", RoomType.Deluxe),
                Room.Create("301", RoomType.Suite),
                Room.Create("302", RoomType.Suite),
                Room.Create("303", RoomType.Suite),
            };

            await context.Rooms.AddRangeAsync(rooms);

            // Seed demo guests (matching frontend demo login users)
            var guests = new[]
            {
                Guest.Create(GuestUserId, "John", "Doe", "john@example.com", "555-0101"),
                Guest.Create(StaffUserId, "Jane", "Smith", "jane@example.com", "555-0102"),
                Guest.Create(AdminUserId, "Admin", "User", "admin@example.com", "555-0103"),
            };

            await context.Guests.AddRangeAsync(guests);

            // Seed guest profiles for demo users
            var guestProfile = GuestProfile.Create(GuestUserId);
            guestProfile.Update("555-0101", "123 Main St, New York, NY", null, true, "en", "USD");
            await context.GuestProfiles.AddAsync(guestProfile);

            // Seed loyalty accounts for demo users
            var loyaltyAccount = LoyaltyAccount.Create(GuestUserId);
            loyaltyAccount.EarnPoints(2500, "Welcome bonus");
            loyaltyAccount.EarnPoints(500, "Booking #1 - 5 nights stay");
            await context.LoyaltyAccounts.AddAsync(loyaltyAccount);

            // Seed loyalty rewards
            var rewards = new[]
            {
                LoyaltyReward.Create("Free Night Stay", "Redeem for one complimentary night at Grand Hotel", null, 5000),
                LoyaltyReward.Create("Spa Treatment", "60-minute relaxation massage at the Grand Spa", null, 2000),
                LoyaltyReward.Create("Room Upgrade", "Upgrade to the next room category for your stay", null, 1500),
                LoyaltyReward.Create("Late Checkout", "Extend your checkout until 4 PM", null, 500),
                LoyaltyReward.Create("Welcome Champagne", "Bottle of premium champagne upon arrival", null, 1000),
            };
            await context.LoyaltyRewards.AddRangeAsync(rewards);

            // Seed concierge services
            var conciergeServices = new[]
            {
                ConciergeService.Create(ConciergeCategory.Spa, "Deep Tissue Massage",
                    "90-minute therapeutic deep tissue massage", 180m, "90 min", "Grand Spa - Level 2", null, 4.8),
                ConciergeService.Create(ConciergeCategory.Spa, "Aromatherapy Facial",
                    "Rejuvenating facial with essential oils", 120m, "60 min", "Grand Spa - Level 2", null, 4.6),
                ConciergeService.Create(ConciergeCategory.FineDining, "Chef's Table Experience",
                    "7-course tasting menu with wine pairing", 350m, "3 hours", "Le Grand Restaurant", null, 4.9),
                ConciergeService.Create(ConciergeCategory.FineDining, "Rooftop Dinner",
                    "Private dinner for two on the rooftop terrace", 250m, "2 hours", "Sky Lounge - Level 20", null, 4.7),
                ConciergeService.Create(ConciergeCategory.Transport, "Airport Transfer",
                    "Luxury sedan transfer to/from airport", 85m, "45 min", "Hotel Lobby", null, 4.5),
                ConciergeService.Create(ConciergeCategory.Transport, "City Limousine",
                    "Chauffeured limousine for city exploration", 200m, "4 hours", "Hotel Lobby", null, 4.4),
                ConciergeService.Create(ConciergeCategory.Tours, "City Walking Tour",
                    "Guided walking tour of historic landmarks", 65m, "3 hours", "Hotel Lobby", null, 4.7),
                ConciergeService.Create(ConciergeCategory.Tours, "Wine Country Day Trip",
                    "Full-day excursion to local vineyards with tastings", 195m, "8 hours", "Hotel Lobby", null, 4.8),
            };
            await context.ConciergeServices.AddRangeAsync(conciergeServices);

            await context.SaveChangesAsync();

            logger.LogInformation("Database seeded with {RoomCount} rooms, {GuestCount} guests, {RewardCount} loyalty rewards, and {ServiceCount} concierge services.",
                rooms.Length, guests.Length, rewards.Length, conciergeServices.Length);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding database.");
        }
    }
}
