using Microsoft.EntityFrameworkCore;
using MinanTrack.Api.Services;

namespace MinanTrack.Api.Data;

public class MinanTrackDbContext : DbContext
{
    public MinanTrackDbContext(DbContextOptions<MinanTrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<ParcelRecord> Parcels => Set<ParcelRecord>();
    public DbSet<ShipmentNotification> Notifications => Set<ShipmentNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ParcelRecord>()
            .HasKey(p => p.TrackingCode);

        modelBuilder.Entity<ParcelRecord>()
            .Property(p => p.TrackingCode)
            .HasMaxLength(32);

        modelBuilder.Entity<ParcelRecord>()
            .OwnsMany(p => p.Events, events =>
            {
                events.WithOwner().HasForeignKey("ParcelTrackingCode");
                events.Property(e => e.Status).HasMaxLength(64);
                events.Property(e => e.Description).HasMaxLength(500);
            });

        modelBuilder.Entity<ShipmentNotification>()
            .HasKey(n => n.Id);

        modelBuilder.Entity<ShipmentNotification>()
            .Property(n => n.Id)
            .HasMaxLength(64);

        modelBuilder.Entity<ShipmentNotification>()
            .Property(n => n.Title)
            .HasMaxLength(128);

        modelBuilder.Entity<ShipmentNotification>()
            .Property(n => n.Message)
            .HasMaxLength(500);

        base.OnModelCreating(modelBuilder);
    }
}
