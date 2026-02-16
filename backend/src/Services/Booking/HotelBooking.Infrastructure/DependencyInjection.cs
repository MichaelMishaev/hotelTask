using HotelBooking.Application.Interfaces;
using HotelBooking.Domain.Interfaces;
using HotelBooking.Infrastructure.Auth;
using HotelBooking.Infrastructure.Caching;
using HotelBooking.Infrastructure.Messaging;
using HotelBooking.Infrastructure.Persistence;
using HotelBooking.Infrastructure.Persistence.Repositories;
using HotelBooking.Infrastructure.Pricing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using StackExchange.Redis;

namespace HotelBooking.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        // Database - use InMemory for Development if no PostgreSQL available
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var useInMemory = configuration.GetValue<bool>("UseInMemoryDatabase");

        if (useInMemory || string.IsNullOrEmpty(connectionString))
        {
            services.AddDbContext<HotelBookingDbContext>(options =>
                options.UseInMemoryDatabase("HotelBooking"));
        }
        else
        {
            services.AddDbContext<HotelBookingDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        // Repositories
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IGuestRepository, GuestRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IGuestProfileRepository, GuestProfileRepository>();
        services.AddScoped<IDigitalKeyRepository, DigitalKeyRepository>();
        services.AddScoped<IStayPreferenceRepository, StayPreferenceRepository>();
        services.AddScoped<ILoyaltyAccountRepository, LoyaltyAccountRepository>();
        services.AddScoped<ILoyaltyRewardRepository, LoyaltyRewardRepository>();
        services.AddScoped<IConciergeServiceRepository, ConciergeServiceRepository>();
        services.AddScoped<IConciergeReservationRepository, ConciergeReservationRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Auth
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // Redis Cache
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect(redisConnection));
            services.AddSingleton<ICacheService, RedisCacheService>();
        }

        // Pricing Service
        services.AddHttpClient<IPricingService, HttpPricingService>(client =>
        {
            client.BaseAddress = new Uri(configuration["PricingService:BaseUrl"] ?? "http://pricing-api:5001");
            client.Timeout = TimeSpan.FromSeconds(3);
        });

        // RabbitMQ
        var rabbitHost = configuration["RabbitMQ:Host"];
        if (!string.IsNullOrEmpty(rabbitHost))
        {
            var factory = new ConnectionFactory
            {
                HostName = rabbitHost,
                UserName = configuration["RabbitMQ:UserName"] ?? "guest",
                Password = configuration["RabbitMQ:Password"] ?? "guest",
                DispatchConsumersAsync = true
            };
            services.AddSingleton<IConnection>(_ => factory.CreateConnection());
            services.AddSingleton<IEventPublisher, RabbitMqPublisher>();
        }

        return services;
    }
}
