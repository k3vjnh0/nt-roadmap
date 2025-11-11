# NT Road Report API Integration

## API Endpoint

The Safe Map application integrates with the Northern Territory Government's Road Report API:

**URL:** `https://roadreport.nt.gov.au/api/Obstruction/GetAll`

## API Response Format

The API returns JSON data in the following structure:

```json
{
  "$id": "1",
  "response": [
    {
      "$id": "2",
      "recordId": 662,
      "obstructionId": 8785,
      "status": "CURRENT",
      "road": 98,
      "roadName": "Dorat Road",
      "lane": "I1",
      "prpFrom": 1,
      "distanceFrom": 0.00,
      "prpTo": 10,
      "distanceTo": 0.00,
      "obstructionType": "Maximum 7 Axles",
      "obstructionTypeCode": "80",
      "restrictionType": "Weight And Or Vehicle Type Restriction",
      "restrictionTypeCode": "66",
      "dateFrom": "2018-06-20 08:30:00",
      "dateTo": null,
      "dateActive": "2018-06-20 08:34:47",
      "startPoint": [-13.2419476100, 131.1108246600],
      "endPoint": [-13.4799245600, 131.1865897900],
      "comment": "No vehicles over 19 metres in length...",
      "locationComment": "Between Stuart Highway Intersection...",
      "isDefaultLocationComment": "True",
      "dateLastUpdated": "2018-06-20 08:34:48",
      "geometry": null,
      "geometries": [],
      "reversed": false
    }
  ]
}
```

## Key Fields Mapping

| NT API Field | Safe Map Field | Description |
|-------------|---------------|-------------|
| `obstructionId` | `id` | Unique identifier |
| `startPoint[0]` | `location.latitude` | Latitude coordinate |
| `startPoint[1]` | `location.longitude` | Longitude coordinate |
| `roadName` | `title` (part) | Road name |
| `obstructionType` | `title` (part), `type` | Type of obstruction |
| `restrictionType` | `type`, `severity` | Restriction type |
| `comment` | `description` | Detailed description |
| `locationComment` | `description` (part) | Location details |
| `status` | `status` | Current status (CURRENT = ACTIVE) |
| `dateFrom` | `reportedAt` | Start date/time |
| `dateLastUpdated` | `updatedAt` | Last update date/time |

## Obstruction Types

Common types returned by the API:
- Road Closed
- Flood Warning
- Weight Restriction
- Height Restriction
- 4WD Only
- Permit Required
- Park Facilities Closed
- Maximum Axles
- Construction Work

## Restriction Types

Common restriction types:
- Road Closed
- Weight And Or Vehicle Type Restriction
- Weather And Road Condition Warning
- Road Construction/Maintenance
- Emergency Closure

## Status Values

- `CURRENT` - Active obstruction (mapped to ACTIVE)
- Other values may be added by NT Gov

## Implementation

See `packages/server/src/services/ntRoadReport.service.ts` for the complete implementation:

1. **Fetching**: GET request to the API endpoint
2. **Parsing**: Extract `response` array from JSON
3. **Mapping**: Transform NT API format to Safe Map incident format
4. **Location**: Extract from `startPoint` array [lat, lng]
5. **Classification**: Map obstruction/restriction types to incident types
6. **Severity**: Determine based on restriction type

## Refresh Rate

The application automatically refreshes incident data:
- Initial load on server start
- Every 5 minutes thereafter
- Manual refresh via API endpoint: `POST /api/incidents/refresh`

## Error Handling

The service includes robust error handling:
- Catches network errors
- Handles malformed data
- Logs parsing errors
- Returns empty array on failure (app continues working)
- Individual item errors don't break the entire feed

## Testing

Test the API directly:

```bash
# Fetch all obstructions
curl -s "https://roadreport.nt.gov.au/api/Obstruction/GetAll" | jq '.'

# Count incidents
curl -s "https://roadreport.nt.gov.au/api/Obstruction/GetAll" | jq '.response | length'

# Get first incident
curl -s "https://roadreport.nt.gov.au/api/Obstruction/GetAll" | jq '.response[0]'
```

## Configuration

Set the API URL in your environment variables:

**Backend `.env`:**
```env
NT_ROAD_REPORT_API=https://roadreport.nt.gov.au/api/Obstruction/GetAll
```

## Rate Limiting

Be mindful of API usage:
- Cache responses (5 minutes default)
- Auto-refresh interval (5 minutes recommended)
- Avoid excessive manual refreshes

## Attribution

Data provided by Northern Territory Government Road Report system.
