using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using MinanTrack.Api.Data;
using MinanTrack.Api.Services;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5107");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy.AllowAnyOrigin();
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING");

var useInMemoryDatabase = string.IsNullOrWhiteSpace(connectionString) || !CanReachPostgres(connectionString);

builder.Services.AddDbContext<MinanTrackDbContext>(options =>
{
    if (useInMemoryDatabase)
    {
        options.UseInMemoryDatabase("MinanTrackDb");
        return;
    }

    options.UseNpgsql(connectionString!);
});

builder.Services.AddScoped<ParcelLifecycleService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MinanTrackDbContext>();
    try
    {
        dbContext.Database.EnsureCreated();
    }
    catch
    {
        var fallbackOptions = new DbContextOptionsBuilder<MinanTrackDbContext>()
            .UseInMemoryDatabase("MinanTrackDb")
            .Options;

        using var fallbackContext = new MinanTrackDbContext(fallbackOptions);
        fallbackContext.Database.EnsureCreated();
    }
}

static bool CanReachPostgres(string connectionString)
{
    try
    {
        using var connection = new NpgsqlConnection(connectionString);
        connection.Open();
        return true;
    }
    catch
    {
        return false;
    }
}

app.UseCors("DefaultCors");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "MinanTrack.Api" }));

app.MapGet("/api/admin/dashboard", (ParcelLifecycleService service) => Results.Ok(service.GetDashboard()));

app.MapGet("/api/routes", (ParcelLifecycleService service) => Results.Ok(service.GetRoutes()));

app.MapGet("/api/notifications", (ParcelLifecycleService service) => Results.Ok(service.GetNotifications()));

app.MapGet("/api/parcels", (ParcelLifecycleService service, string? status, string? route, string? agent, string? search) => Results.Ok(service.GetParcels(status, route, agent, search)));

app.MapGet("/api/parcels/{trackingCode}", (ParcelLifecycleService service, string trackingCode) =>
{
    var result = service.GetTrackingResponse(trackingCode);
    return result is null ? Results.NotFound(new { message = $"Parcel {trackingCode} was not found." }) : Results.Ok(result);
});

app.MapGet("/api/parcels/track/{trackingCode}", (ParcelLifecycleService service, string trackingCode) =>
{
    var result = service.GetTrackingResponse(trackingCode);
    return result is null ? Results.NotFound(new { message = $"Parcel {trackingCode} was not found." }) : Results.Ok(result);
});

app.MapPost("/api/parcels", (ParcelLifecycleService service, CreateParcelRequest request) =>
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

    var parcel = service.CreateParcel(request);

    return Results.Created($"/api/parcels/{parcel.TrackingCode}", new
    {
        trackingCode = parcel.TrackingCode,
        status = parcel.Status,
        sender = parcel.SenderName,
        recipient = parcel.RecipientName,
        destination = parcel.Destination,
        createdAt = parcel.CreatedAt,
        routeName = parcel.RouteName,
        assignedAgent = parcel.AssignedAgent
    });
});

app.MapPatch("/api/parcels/{trackingCode}/status", (ParcelLifecycleService service, string trackingCode, UpdateParcelStatusRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Status))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["request"] = ["Status is required."]
        });
    }

    try
    {
        var result = service.UpdateStatus(trackingCode, request);
        return result is null
            ? Results.NotFound(new { message = $"Parcel {trackingCode} was not found." })
            : Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["request"] = [ex.Message]
        });
    }
});

app.MapPatch("/api/parcels/{trackingCode}/assign-route", (ParcelLifecycleService service, string trackingCode, AssignRouteRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.RouteName) || string.IsNullOrWhiteSpace(request.AssignedAgent))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["request"] = ["Route name and assigned agent are required."]
        });
    }

    var result = service.AssignRoute(trackingCode, request);
    return result is null
        ? Results.NotFound(new { message = $"Parcel {trackingCode} was not found." })
        : Results.Ok(result);
});

app.MapPost("/api/pricing/estimate", (ParcelLifecycleService service, PricingRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Destination) || request.WeightKg <= 0)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["request"] = ["Destination and weight are required."]
        });
    }

    return Results.Ok(service.EstimatePricing(request));
});

app.Run();

