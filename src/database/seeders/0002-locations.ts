import { QueryInterface } from "sequelize";

export async function up({ context }: { context: QueryInterface }) {
  await context.bulkInsert("locations", [
    {
      name: "Main Hospital",
      latitude: "17.385044",
      longitude: "78.486671",
      google_maps_url: "https://www.google.com/maps/place/Main+Hospital",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Downtown Clinic",
      latitude: "17.4371",
      longitude: "78.4489",
      google_maps_url: "https://www.google.com/maps/place/Downtown+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Uptown Clinic",
      latitude: "17.4020",
      longitude: "78.5000",
      google_maps_url: "https://www.google.com/maps/place/Uptown+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Eastside Health Center",
      latitude: "17.3650",
      longitude: "78.5120",
      google_maps_url:
        "https://www.google.com/maps/place/Eastside+Health+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Westside Health Center",
      latitude: "17.3900",
      longitude: "78.4200",
      google_maps_url:
        "https://www.google.com/maps/place/Westside+Health+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "North Medical Center",
      latitude: "17.4600",
      longitude: "78.4800",
      google_maps_url: "https://www.google.com/maps/place/North+Medical+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "South Medical Center",
      latitude: "17.3300",
      longitude: "78.4800",
      google_maps_url: "https://www.google.com/maps/place/South+Medical+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Pediatrics Clinic",
      latitude: "17.4200",
      longitude: "78.4600",
      google_maps_url: "https://www.google.com/maps/place/Pediatrics+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Cardiology Center",
      latitude: "17.3950",
      longitude: "78.4910",
      google_maps_url: "https://www.google.com/maps/place/Cardiology+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Radiology Center",
      latitude: "17.4100",
      longitude: "78.4700",
      google_maps_url: "https://www.google.com/maps/place/Radiology+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Oncology Center",
      latitude: "17.4000",
      longitude: "78.4550",
      google_maps_url: "https://www.google.com/maps/place/Oncology+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Endocrinology Department",
      latitude: "17.3890",
      longitude: "78.4340",
      google_maps_url:
        "https://www.google.com/maps/place/Endocrinology+Department",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Dermatology Clinic",
      latitude: "17.3760",
      longitude: "78.4420",
      google_maps_url: "https://www.google.com/maps/place/Dermatology+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Orthopedics Clinic",
      latitude: "17.3880",
      longitude: "78.4520",
      google_maps_url: "https://www.google.com/maps/place/Orthopedics+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Emergency Department",
      latitude: "17.3855",
      longitude: "78.4865",
      google_maps_url: "https://www.google.com/maps/place/Emergency+Department",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Urgent Care",
      latitude: "17.3700",
      longitude: "78.4800",
      google_maps_url: "https://www.google.com/maps/place/Urgent+Care",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Laboratory Services",
      latitude: "17.3920",
      longitude: "78.4800",
      google_maps_url: "https://www.google.com/maps/place/Laboratory+Services",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Pharmacy",
      latitude: "17.3895",
      longitude: "78.4850",
      google_maps_url: "https://www.google.com/maps/place/Pharmacy",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Rehabilitation Center",
      latitude: "17.3955",
      longitude: "78.4705",
      google_maps_url:
        "https://www.google.com/maps/place/Rehabilitation+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Maternity Ward",
      latitude: "17.3800",
      longitude: "78.4900",
      google_maps_url: "https://www.google.com/maps/place/Maternity+Ward",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Neonatal Unit",
      latitude: "17.3820",
      longitude: "78.4910",
      google_maps_url: "https://www.google.com/maps/place/Neonatal+Unit",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Mental Health Clinic",
      latitude: "17.3990",
      longitude: "78.4650",
      google_maps_url: "https://www.google.com/maps/place/Mental+Health+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Dental Clinic",
      latitude: "17.3860",
      longitude: "78.4720",
      google_maps_url: "https://www.google.com/maps/place/Dental+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "ENT Clinic",
      latitude: "17.3910",
      longitude: "78.4690",
      google_maps_url: "https://www.google.com/maps/place/ENT+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Ophthalmology Center",
      latitude: "17.3925",
      longitude: "78.4665",
      google_maps_url: "https://www.google.com/maps/place/Ophthalmology+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Geriatrics Center",
      latitude: "17.3705",
      longitude: "78.4555",
      google_maps_url: "https://www.google.com/maps/place/Geriatrics+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Primary Care",
      latitude: "17.3870",
      longitude: "78.4790",
      google_maps_url: "https://www.google.com/maps/place/Primary+Care",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Community Health Center",
      latitude: "17.3730",
      longitude: "78.4620",
      google_maps_url:
        "https://www.google.com/maps/place/Community+Health+Center",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Telemedicine Hub",
      latitude: "17.4000",
      longitude: "78.4700",
      google_maps_url: "https://www.google.com/maps/place/Telemedicine+Hub",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
    {
      name: "Mobile Clinic",
      latitude: "17.3600",
      longitude: "78.4400",
      google_maps_url: "https://www.google.com/maps/place/Mobile+Clinic",
      created_by_id: "1a3e365d-1210-496a-a043-813a58401144",
    },
  ]);
}

// export async function down({ context }: { context: QueryInterface }) {
//   await context.bulkDelete("locations", {
//     role_id: [1, 2, 3],
//   });
// }
