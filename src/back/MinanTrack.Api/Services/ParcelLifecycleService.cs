using Microsoft.EntityFrameworkCore;
using MinanTrack.Api.Data;

namespace MinanTrack.Api.Services;

public sealed class ParcelLifecycleService
{
    private readonly MinanTrackDbContext _context;

    public ParcelLifecycleService(MinanTrackDbContext context)
    {
        _context = context;
        EnsureSeedData();
    }

    public IReadOnlyCollection<ParcelRecord> Parcels =>
        _context.Parcels
            .Include(p => p.Events)
            .AsNoTracking()
            .ToList();

    public object GetDashboard()
    {
        var parcels = _context.Parcels
            .Include(p => p.Events)
            .AsNoTracking()
            .ToList();

        var activeParcels = parcels.Count(p => p.Status != "Delivered");
        var delayedParcels = parcels.Count(p => p.Status == "Delayed" || p.IsDelayed);

        return new
        {
            totalParcels = parcels.Count,
            activeParcels,
            delayedParcels,
            recentParcels = parcels
                .OrderByDescending(p => p.UpdatedAt)
                .Take(5)
                .Select(p => new
                {
                    p.TrackingCode,
                    p.Status,
                    p.Destination,
                    p.RouteName,
                    p.AssignedAgent,
                    p.UpdatedAt
                })
        };
    }

    public object GetRoutes()
    {
        var parcels = _context.Parcels
            .Include(p => p.Events)
            .AsNoTracking()
            .ToList();

        var routes = parcels
            .GroupBy(p => p.RouteName)
            .Select(g => new
            {
                name = g.Key,
                activeParcels = g.Count(),
                delayedParcels = g.Count(p => p.Status == "Delayed" || p.IsDelayed),
                agents = g
                    .Where(p => !string.IsNullOrWhiteSpace(p.AssignedAgent))
                    .Select(p => p.AssignedAgent)
                    .Distinct()
                    .OrderBy(a => a)
                    .ToList()
            })
            .OrderBy(route => route.name)
            .ToList();

        return new { routes };
    }

    public object GetNotifications()
    {
        return new
        {
            items = _context.Notifications
                .AsNoTracking()
                .OrderByDescending(n => n.CreatedAt)
                .Take(10)
                .Select(n => new
                {
                    n.Id,
                    n.Type,
                    n.Title,
                    n.Message,
                    n.TrackingCode,
                    n.CreatedAt,
                    n.Priority
                })
                .ToList()
        };
    }

    public object GetParcels(string? status, string? route, string? agent, string? search)
    {
        var filtered = _context.Parcels
            .Include(p => p.Events)
            .AsNoTracking()
            .AsEnumerable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            filtered = filtered.Where(p => p.Status.Contains(status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(route))
        {
            filtered = filtered.Where(p => p.RouteName.Contains(route, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(agent))
        {
            filtered = filtered.Where(p => p.AssignedAgent != null && p.AssignedAgent.Contains(agent, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            filtered = filtered.Where(p =>
                p.TrackingCode.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Destination.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.RecipientName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        return new
        {
            items = filtered
                .OrderByDescending(p => p.UpdatedAt)
                .Select(p => new ParcelSummaryResponse(
                    p.TrackingCode,
                    p.Status,
                    p.CurrentLocation,
                    p.Destination,
                    p.RouteName,
                    p.AssignedAgent,
                    p.UpdatedAt,
                    p.IsDelayed))
                .ToList()
        };
    }

    public ParcelTrackingResponse? GetTrackingResponse(string trackingCode)
    {
        var parcel = _context.Parcels
            .Include(p => p.Events)
            .SingleOrDefault(p => p.TrackingCode == trackingCode);

        if (parcel is null)
        {
            return null;
        }

        return new ParcelTrackingResponse(
            parcel.TrackingCode,
            parcel.Status,
            parcel.CurrentLocation,
            parcel.LastUpdated,
            parcel.Events
                .OrderBy(e => e.OccurredAt)
                .Select(e => new ShipmentEventResponse(e.Status, e.Description, e.OccurredAt))
                .ToList());
    }

    public ParcelRecord CreateParcel(CreateParcelRequest request)
    {
        var trackingCode = $"DT-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        var now = DateTimeOffset.UtcNow;

        var parcel = new ParcelRecord
        {
            TrackingCode = trackingCode,
            SenderName = request.SenderName,
            RecipientName = request.RecipientName,
            Destination = request.Destination,
            WeightKg = request.WeightKg,
            Status = "Registered",
            CurrentLocation = "Collecte en attente",
            RouteName = "Hub Nord",
            AssignedAgent = "Amina Diallo",
            CreatedAt = now,
            UpdatedAt = now,
            IsDelayed = false,
            Events =
            [
                new ShipmentEvent("Registered", "Colis enregistré et en attente de collecte.", now),
                new ShipmentEvent("Pickup pending", "La collecte a été programmée.", now.AddMinutes(15))
            ]
        };

        _context.Parcels.Add(parcel);
        _context.SaveChanges();
        return parcel;
    }

    public ParcelTrackingResponse? UpdateStatus(string trackingCode, UpdateParcelStatusRequest request)
    {
        var parcel = _context.Parcels
            .Include(p => p.Events)
            .SingleOrDefault(p => p.TrackingCode == trackingCode);

        if (parcel is null)
        {
            return null;
        }

        var normalizedStatus = NormalizeStatus(request.Status);
        if (!CanTransition(parcel.Status, normalizedStatus))
        {
            throw new InvalidOperationException($"Invalid status transition from '{parcel.Status}' to '{normalizedStatus}'.");
        }

        var now = DateTimeOffset.UtcNow;
        parcel.Status = normalizedStatus;
        parcel.CurrentLocation = string.IsNullOrWhiteSpace(request.CurrentLocation) ? parcel.CurrentLocation : request.CurrentLocation;
        parcel.RouteName = string.IsNullOrWhiteSpace(request.RouteName) ? parcel.RouteName : request.RouteName;
        parcel.AssignedAgent = string.IsNullOrWhiteSpace(request.AssignedAgent) ? parcel.AssignedAgent : request.AssignedAgent;
        parcel.IsDelayed = request.Status.Equals("Delayed", StringComparison.OrdinalIgnoreCase) || request.IsDelayed;
        parcel.UpdatedAt = now;

        parcel.Events.Add(new ShipmentEvent(
            normalizedStatus,
            string.IsNullOrWhiteSpace(request.Note) ? $"Status updated to {normalizedStatus}." : request.Note,
            now));

        if (parcel.IsDelayed)
        {
            _context.Notifications.Add(new ShipmentNotification(
                Guid.NewGuid().ToString("N"),
                "delay",
                "Colis retardé",
                $"{parcel.TrackingCode} est retardé et nécessite un suivi.",
                parcel.TrackingCode,
                now,
                "high"));
        }
        else if (parcel.Status == "Delivered")
        {
            _context.Notifications.Add(new ShipmentNotification(
                Guid.NewGuid().ToString("N"),
                "delivery",
                "Colis livré",
                $"{parcel.TrackingCode} a atteint son étape finale de livraison.",
                parcel.TrackingCode,
                now,
                "normal"));
        }

        _context.SaveChanges();

        return new ParcelTrackingResponse(
            parcel.TrackingCode,
            parcel.Status,
            parcel.CurrentLocation,
            parcel.LastUpdated,
            parcel.Events
                .OrderBy(e => e.OccurredAt)
                .Select(e => new ShipmentEventResponse(e.Status, e.Description, e.OccurredAt))
                .ToList());
    }

    public object? AssignRoute(string trackingCode, AssignRouteRequest request)
    {
        var parcel = _context.Parcels
            .Include(p => p.Events)
            .SingleOrDefault(p => p.TrackingCode == trackingCode);

        if (parcel is null)
        {
            return null;
        }

        var now = DateTimeOffset.UtcNow;
        parcel.RouteName = request.RouteName;
        parcel.AssignedAgent = request.AssignedAgent;
        parcel.UpdatedAt = now;
        parcel.Events.Add(new ShipmentEvent("Assigned", $"Colis assigné à la route {request.RouteName} avec {request.AssignedAgent}.", now));

        _context.Notifications.Add(new ShipmentNotification(
            Guid.NewGuid().ToString("N"),
            "route",
            "Route assignée",
            $"{parcel.TrackingCode} a été assigné à la route {request.RouteName} et à l’agent {request.AssignedAgent}.",
            parcel.TrackingCode,
            now,
            "normal"));

        _context.SaveChanges();

        return new
        {
            trackingCode,
            routeName = parcel.RouteName,
            assignedAgent = parcel.AssignedAgent,
            updatedAt = parcel.UpdatedAt
        };
    }

    public object EstimatePricing(PricingRequest request)
    {
        var serviceLevel = request.ServiceLevel?.Trim();
        var multiplier = serviceLevel?.ToLowerInvariant() switch
        {
            "express" => 1.45m,
            "priority" => 1.2m,
            _ => 1m
        };

        var baseRate = 180m;
        var weightCost = request.WeightKg * 22m;
        var zoneFactor = request.Destination.Contains("France", StringComparison.OrdinalIgnoreCase) || request.Destination.Contains("Europe", StringComparison.OrdinalIgnoreCase) ? 1.2m : 1m;
        var estimatedCost = (baseRate + weightCost) * zoneFactor * multiplier;
        var estimatedDeliveryDays = serviceLevel?.ToLowerInvariant() switch
        {
            "express" => 2,
            "priority" => 4,
            _ => 6
        };

        return new
        {
            estimatedCost = Math.Round(estimatedCost, 2),
            estimatedDeliveryDays,
            destination = request.Destination,
            currency = "XOF",
            serviceLevel = string.IsNullOrWhiteSpace(serviceLevel) ? "Standard" : serviceLevel
        };
    }

    private void EnsureSeedData()
    {
        if (_context.Parcels.Any())
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var sample = new ParcelRecord
        {
            TrackingCode = "DT-SAMPLE01",
            SenderName = "Awa Diakité",
            RecipientName = "Moussa Traoré",
            Destination = "Bamako, Mali",
            WeightKg = 3.5m,
            Status = "In transit",
            CurrentLocation = "Hub de tri de Bamako",
            RouteName = "Hub Nord",
            AssignedAgent = "Amina Diallo",
            CreatedAt = now.AddHours(-32),
            UpdatedAt = now.AddHours(-8),
            IsDelayed = false,
            Events =
            [
                new ShipmentEvent("Registered", "Colis enregistré", now.AddHours(-36)),
                new ShipmentEvent("Picked up", "Le coursier a récupéré le colis chez l’expéditeur", now.AddHours(-24)),
                new ShipmentEvent("In transit", "Le colis est en cours de transit sur la route régionale", now.AddHours(-8)),
                new ShipmentEvent("Customs review", "La documentation douanière est en cours de vérification", now.AddHours(-2))
            ]
        };

        _context.Parcels.Add(sample);
        _context.Notifications.AddRange(
            new ShipmentNotification(
                "n1",
                "route",
                "Route assignée",
                "DT-SAMPLE01 a été assigné au Hub Nord et à Amina Diallo.",
                "DT-SAMPLE01",
                DateTimeOffset.UtcNow.AddMinutes(-40),
                "normal"),
            new ShipmentNotification(
                "n2",
                "delay",
                "Suivi douanier",
                "Un colis nécessite une vérification de documentation douanière.",
                "DT-SAMPLE01",
                DateTimeOffset.UtcNow.AddMinutes(-10),
                "high"));

        _context.SaveChanges();
    }

    public static string NormalizeStatus(string status)
    {
        return status.Trim();
    }

    public static bool CanTransition(string currentStatus, string nextStatus)
    {
        var current = currentStatus.Trim();
        var next = nextStatus.Trim();

        var validTransitions = new Dictionary<string, string[]>
        {
            ["Registered"] = ["Picked up", "Delayed"],
            ["Picked up"] = ["In transit", "Delayed"],
            ["In transit"] = ["Customs review", "Delayed", "Delivered"],
            ["Customs review"] = ["In transit", "Delayed", "Delivered"],
            ["Delayed"] = ["In transit", "Delivered", "Customs review"],
            ["Delivered"] = ["Delivered"]
        };

        if (!validTransitions.TryGetValue(current, out var allowed))
        {
            return current == next;
        }

        return allowed.Contains(next, StringComparer.OrdinalIgnoreCase);
    }
}

public record CreateParcelRequest(string SenderName, string Destination, string RecipientName, decimal WeightKg);
public record PricingRequest(string Destination, decimal WeightKg, string? ServiceLevel);
public record UpdateParcelStatusRequest(string Status, string? CurrentLocation, string? RouteName, string? AssignedAgent, string? Note, bool IsDelayed);
public record AssignRouteRequest(string RouteName, string AssignedAgent);

public record ParcelTrackingResponse(string TrackingCode, string Status, string CurrentLocation, DateTimeOffset LastUpdated, List<ShipmentEventResponse> Timeline);
public record ParcelDetailResponse(string TrackingCode, string Status, string CurrentLocation, DateTimeOffset LastUpdated, List<ShipmentEventResponse> Timeline);
public record ParcelSummaryResponse(string TrackingCode, string Status, string CurrentLocation, string Destination, string RouteName, string? AssignedAgent, DateTimeOffset UpdatedAt, bool IsDelayed);
public record ShipmentEventResponse(string Status, string Description, DateTimeOffset OccurredAt);
public record ShipmentNotification(string Id, string Type, string Title, string Message, string TrackingCode, DateTimeOffset CreatedAt, string Priority);

public class ParcelRecord
{
    public string TrackingCode { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CurrentLocation { get; set; } = string.Empty;
    public string RouteName { get; set; } = "Unassigned";
    public string? AssignedAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public bool IsDelayed { get; set; }
    public List<ShipmentEvent> Events { get; set; } = new();

    public DateTimeOffset LastUpdated => Events.Count > 0 ? Events.Max(e => e.OccurredAt) : UpdatedAt;
}

public record ShipmentEvent(string Status, string Description, DateTimeOffset OccurredAt);
