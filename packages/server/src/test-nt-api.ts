// Quick test script to verify NT Road Report API integration
import { NTRoadReportService } from './services/ntRoadReport.service';

async function testNTAPI() {
  console.log('Testing NT Road Report API Integration...\n');
  
  const service = new NTRoadReportService();
  
  try {
    console.log('Fetching incidents from NT Road Report API...');
    const incidents = await service.fetchIncidents();
    
    console.log(`\n✅ Successfully fetched ${incidents.length} incidents\n`);
    
    if (incidents.length > 0) {
      console.log('Sample incident:');
      console.log('================');
      const sample = incidents[0];
      console.log(`ID: ${sample.id}`);
      console.log(`Type: ${sample.type}`);
      console.log(`Severity: ${sample.severity}`);
      console.log(`Status: ${sample.status}`);
      console.log(`Title: ${sample.title}`);
      console.log(`Description: ${sample.description.substring(0, 100)}...`);
      console.log(`Location: ${sample.location.latitude}, ${sample.location.longitude}`);
      console.log(`Reported: ${sample.reportedAt}`);
      console.log(`Updated: ${sample.updatedAt}`);
      
      // Count by type
      console.log('\n\nIncidents by type:');
      console.log('==================');
      const byType = incidents.reduce((acc, inc) => {
        acc[inc.type] = (acc[inc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`${type}: ${count}`);
      });
      
      // Count by severity
      console.log('\n\nIncidents by severity:');
      console.log('======================');
      const bySeverity = incidents.reduce((acc, inc) => {
        acc[inc.severity] = (acc[inc.severity] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      Object.entries(bySeverity).forEach(([severity, count]) => {
        console.log(`Level ${severity}: ${count}`);
      });
    } else {
      console.log('⚠️  No incidents found (API may be empty)');
    }
    
  } catch (error) {
    console.error('❌ Error testing NT API:', error);
  }
}

// Run the test
testNTAPI();
