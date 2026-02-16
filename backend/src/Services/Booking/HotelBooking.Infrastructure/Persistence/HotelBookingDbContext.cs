using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence;

public class HotelBookingDbContext : DbContext, IUnitOfWork
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<AuditLogEntry> AuditLogs => Set<AuditLogEntry>();
    public DbSet<GuestProfile> GuestProfiles => Set<GuestProfile>();
    public DbSet<DigitalKey> DigitalKeys => Set<DigitalKey>();
    public DbSet<StayPreference> StayPreferences => Set<StayPreference>();
    public DbSet<StayPreferenceAmenity> StayPreferenceAmenities => Set<StayPreferenceAmenity>();
    public DbSet<LoyaltyAccount> LoyaltyAccounts => Set<LoyaltyAccount>();
    public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();
    public DbSet<LoyaltyReward> LoyaltyRewards => Set<LoyaltyReward>();
    public DbSet<ConciergeService> ConciergeServices => Set<ConciergeService>();
    public DbSet<ConciergeReservation> ConciergeReservations => Set<ConciergeReservation>();

    public HotelBookingDbContext(DbContextOptions<HotelBookingDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Room configuration
        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RoomNumber).HasMaxLength(10).IsRequired();
            entity.Property(e => e.RoomType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.RoomNumber).IsUnique();
            entity.HasMany(e => e.Bookings).WithOne(b => b.Room).HasForeignKey(b => b.RoomId);
            entity.Ignore(e => e.DomainEvents);
        });

        // Guest configuration
        modelBuilder.Entity<Guest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasMany(e => e.Bookings).WithOne(b => b.Guest).HasForeignKey(b => b.GuestId);
            entity.Ignore(e => e.DomainEvents);
        });

        // Booking configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

            entity.OwnsOne(e => e.DateRange, dr =>
            {
                dr.Property(d => d.CheckIn).HasColumnName("CheckIn").IsRequired();
                dr.Property(d => d.CheckOut).HasColumnName("CheckOut").IsRequired();
            });

            entity.OwnsOne(e => e.TotalAmount, m =>
            {
                m.Property(mm => mm.Amount).HasColumnName("TotalAmount")
                    .HasColumnType("decimal(18,2)").IsRequired();
            });

            entity.Ignore(e => e.DomainEvents);
        });

        // AuditLog - append only
        modelBuilder.Entity<AuditLogEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.UserId).HasMaxLength(100);
            entity.Property(e => e.Details).HasMaxLength(4000);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
        });

        // GuestProfile configuration
        modelBuilder.Entity<GuestProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.AvatarUrl).HasMaxLength(2000);
            entity.Property(e => e.Language).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Currency).HasMaxLength(10).IsRequired();
            entity.HasIndex(e => e.GuestId).IsUnique();
            entity.HasOne(e => e.Guest).WithOne().HasForeignKey<GuestProfile>(e => e.GuestId);
            entity.Ignore(e => e.DomainEvents);
        });

        // DigitalKey configuration
        modelBuilder.Entity<DigitalKey>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RoomNumber).HasMaxLength(10).IsRequired();
            entity.Property(e => e.RoomType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasOne(e => e.Booking).WithMany().HasForeignKey(e => e.BookingId);
            entity.HasOne(e => e.Guest).WithMany().HasForeignKey(e => e.GuestId);
            entity.HasIndex(e => e.BookingId);
            entity.HasIndex(e => e.GuestId);
            entity.Ignore(e => e.DomainEvents);
        });

        // StayPreference configuration
        modelBuilder.Entity<StayPreference>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PillowType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.MinibarPreference).HasConversion<string>().HasMaxLength(20);
            entity.HasOne(e => e.Booking).WithMany().HasForeignKey(e => e.BookingId);
            entity.HasOne(e => e.Guest).WithMany().HasForeignKey(e => e.GuestId);
            entity.HasMany(e => e.Amenities).WithOne(a => a.StayPreference).HasForeignKey(a => a.StayPreferenceId);
            entity.HasIndex(e => e.BookingId);
            entity.Ignore(e => e.DomainEvents);
        });

        // StayPreferenceAmenity configuration
        modelBuilder.Entity<StayPreferenceAmenity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AmenityName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.AmenityDescription).HasMaxLength(1000);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Ignore(e => e.DomainEvents);
        });

        // LoyaltyAccount configuration
        modelBuilder.Entity<LoyaltyAccount>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Tier).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.GuestId).IsUnique();
            entity.HasOne(e => e.Guest).WithOne().HasForeignKey<LoyaltyAccount>(e => e.GuestId);
            entity.HasMany(e => e.Transactions).WithOne(t => t.LoyaltyAccount).HasForeignKey(t => t.LoyaltyAccountId);
            entity.Ignore(e => e.DomainEvents);
        });

        // LoyaltyTransaction configuration
        modelBuilder.Entity<LoyaltyTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(e => e.LoyaltyAccountId);
            entity.Ignore(e => e.DomainEvents);
        });

        // LoyaltyReward configuration
        modelBuilder.Entity<LoyaltyReward>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ImageUrl).HasMaxLength(2000);
            entity.Ignore(e => e.DomainEvents);
        });

        // ConciergeService configuration
        modelBuilder.Entity<ConciergeService>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Category).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Duration).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.ImageUrl).HasMaxLength(2000);
            entity.HasMany(e => e.Reservations).WithOne(r => r.Service).HasForeignKey(r => r.ServiceId);
            entity.Ignore(e => e.DomainEvents);
        });

        // ConciergeReservation configuration
        modelBuilder.Entity<ConciergeReservation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasOne(e => e.Guest).WithMany().HasForeignKey(e => e.GuestId);
            entity.HasOne(e => e.Booking).WithMany().HasForeignKey(e => e.BookingId);
            entity.HasIndex(e => e.GuestId);
            entity.HasIndex(e => e.ServiceId);
            entity.Ignore(e => e.DomainEvents);
        });
    }
}
