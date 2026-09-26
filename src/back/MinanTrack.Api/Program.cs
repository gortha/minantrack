using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var parcels = new Dictionary<string, ParcelRecord>(StringComparer.OrdinalIgnoreCase);

SeedSampleParcel();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "MinanTrack.Api" }));

app.MapGet("/api/admin/dashboard", () =>
{
    var activeParcels = parcels.Values.Count(p => p.Status != "Delivered");
    var lateParcels = parcels.Values.Count(p => p.Status == "Delayed");

    return Results.Ok(new
    {
        totalParcels = parcels.Count,
        activeParcels,
        delayedParcels = lateParcels,
        recentParcels = parcels.Values
            .OrderByDescending(p => p.UpdatedAt)
            .Take(5)
            .Select(p => new
            {
                p.TrackingCode,
                p.Status,
                p.Destination,
                p.UpdatedAt
            })
    });
});

app.MapGet("/api/parcels/{trackingCode}", (string trackingCode) =>
{
    if (!parcels.TryGetValue(trackingCode, out var parcel))
    {
        return Results.NotFound(new { message = $"Parcel {trackingCode} was not found." });
    }

    return Results.Ok(new ParcelDetailResponse(
        parcel.TrackingCode,
        parcel.Status,
        parcel.CurrentLocation,
        parcel.LastUpdated,
        parcel.Events
            .OrderBy(e => e.OccurredAt)
            .Select(e => new ShipmentEventResponse(e.Status, e.Description, e.OccurredAt))
            .ToList()));
});

app.MapGet("/api/parcels/track/{trackingCode}", (string trackingCode) =>
{
    if (!parcels.TryGetValue(trackingCode, out var parcel))
    {
        return Results.NotFound(new { message = $"Parcel {trackingCode} was not found." });
    }

    return Results.Ok(new ParcelTrackingResponse(
        parcel.TrackingCode,
        parcel.Status,
        parcel.CurrentLocation,
        parcel.LastUpdated,
        parcel.Events
            .OrderBy(e => e.OccurredAt)
            .Select(e => new ShipmentEventResponse(e.Status, e.Description, e.OccurredAt))
            .ToList()));
});

app.MapPost("/api/parcels", (CreateParcelRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.SenderName) ||
        string.IsNullOrWhiteSpace(request.Destination) ||
        string.IsNullOrWhiteSpace(request.RecipientName) ||
        request.WeightKg <= 0)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["request"] = ["Sender, destination, recipient, and weight are required."]
        });
    }

    var trackingCode = $"DT-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    var now = DateTimeOffset.UtcNow;

    var parcel = new ParcelRecord(
        trackingCode,
        request.SenderName,
        request.RecipientName,
        request.Destination,
        request.WeightKg,
        "Registered",
        "Pickup pending",
        now,
        now,
        [
            new ShipmentEvent("Registered", "Parcel registered and awaiting pickup.", now),
            new ShipmentEvent("Pickup pending", "Pickup has been scheduled.", now.AddMinutes(15))
        ]);

    parcels[trackingCode] = parcel;

    return Results.Created($"/api/parcels/{trackingCode}", new
    {
        trackingCode,
        status = parcel.Status,
        sender = parcel.SenderName,
        recipient = parcel.RecipientName,
        destination = parcel.Destination,
        createdAt = parcel.CreatedAt
    });
});

app.MapPost("/api/pricing/estimate", (PricingRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Destination) || request.WeightKg <= 0)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["request"] = ["Destination and weight are required."]
        });
    }

    var serviceLevel = request.ServiceLevel?.Trim();
    var multiplier = serviceLevel?.ToLowerInvariant() switch
    {
        "express" => 1.45m,
        "priority" => 1.2m,
        _ => 1m
    };

    var baseRate = 180m;
    var weightCost = request.WeightKg * 22m;
    var zoneFactor = request.Destination.Contains("France") || request.Destination.Contains("Europe") ? 1.2m : 1m;
    var estimatedCost = (baseRate + weightCost) * zoneFactor * multiplier;
    var estimatedDeliveryDays = serviceLevel?.ToLowerInvariant() switch
    {
        "express" => 2,
        "priority" => 4,
        _ => 6
    };

    return Results.Ok(new
    {
        estimatedCost = Math.Round(estimatedCost, 2),
        estimatedDeliveryDays,
        destination = request.Destination,
        currency = "XOF",
        serviceLevel = string.IsNullOrWhiteSpace(serviceLevel) ? "Standard" : serviceLevel
    });
});

app.Run();

void SeedSampleParcel()
{
    var now = DateTimeOffset.UtcNow;
    var sample = new ParcelRecord(
        "DT-SAMPLE01",
        "Awa Diakité",
        "Moussa Traoré",
        "Bamako, Mali",
        3.5m,
        "In transit",
        "Bamako sorting hub",
        now.AddHours(-32),
        now.AddHours(-8),
        [
            new ShipmentEvent("Registered", "Parcel registered", now.AddHours(-36)),
            new ShipmentEvent("Picked up", "Courier collected the parcel from sender", now.AddHours(-24)),
            new ShipmentEvent("In transit", "Parcel is moving through the regional route", now.AddHours(-8)),
            new ShipmentEvent("Customs review", "Customs documentation is being verified", now.AddHours(-2))
        ]);

    parcels["DT-SAMPLE01"] = sample;
}

public record CreateParcelRequest(string SenderName, string Destination, string RecipientName, decimal WeightKg);
public record PricingRequest(string Destination, decimal WeightKg, string? ServiceLevel);

public record ParcelTrackingResponse(string TrackingCode, string Status, string CurrentLocation, DateTimeOffset LastUpdated, List<ShipmentEventResponse> Timeline);
public record ParcelDetailResponse(string TrackingCode, string Status, string CurrentLocation, DateTimeOffset LastUpdated, List<ShipmentEventResponse> Timeline);
public record ShipmentEventResponse(string Status, string Description, DateTimeOffset OccurredAt);

public record ParcelRecord(
    string TrackingCode,
    string SenderName,
    string RecipientName,
    string Destination,
    decimal WeightKg,
    string Status,
    string CurrentLocation,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    List<ShipmentEvent> Events)
{
    public DateTimeOffset LastUpdated => Events.Count > 0 ? Events.Max(e => e.OccurredAt) : UpdatedAt;
}

public record ShipmentEvent(string Status, string Description, DateTimeOffset OccurredAt);
