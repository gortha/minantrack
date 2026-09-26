using Microsoft.EntityFrameworkCore;
using MinanTrack.Api.Data;
using MinanTrack.Api.Services;
using Xunit;

namespace MinanTrack.Api.Tests;

public class ParcelLifecycleServiceTests
{
    [Fact]
    public void DbContext_ShouldExposeParcelAndNotificationSets()
    {
        var options = new DbContextOptionsBuilder<MinanTrackDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new MinanTrackDbContext(options);

        Assert.NotNull(context.Parcels);
        Assert.NotNull(context.Notifications);
    }

    [Fact]
    public void StatusTransition_ShouldAllowRegisteredToPickedUp()
    {
        var result = ParcelLifecycleService.CanTransition("Registered", "Picked up");

        Assert.True(result);
    }

    [Fact]
    public void Notifications_ShouldUseFrenchLabelsByDefault()
    {
        var options = new DbContextOptionsBuilder<MinanTrackDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new MinanTrackDbContext(options);
        var service = new ParcelLifecycleService(context);

        var notificationPayload = service.GetNotifications();
        var json = System.Text.Json.JsonSerializer.Serialize(notificationPayload);

        Assert.Contains("Route", json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Suivi", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Route assigned", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Parcel delayed", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Customs follow-up", json, StringComparison.OrdinalIgnoreCase);
    }
}
