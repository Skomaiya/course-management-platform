const redis = require('redis');

// Redis connection configuration
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

// Monitor Bull queue
async function monitorQueue() {
  try {
    console.log('\n=== Redis Queue Monitor ===\n');
    
    // Get all Bull-related keys
    const keys = await redisClient.keys('bull:*');
    console.log('Bull Queue Keys:', keys);
    
    if (keys.length === 0) {
      console.log('No Bull queues found. Make sure the application is running and jobs are being added.');
      return;
    }
    
    // Check reminder queue specifically
    const queueKeys = [
      'bull:reminder-queue:wait',
      'bull:reminder-queue:active', 
      'bull:reminder-queue:completed',
      'bull:reminder-queue:failed',
      'bull:reminder-queue:delayed'
    ];
    
    console.log('\n=== Queue Status ===');
    
    for (const key of queueKeys) {
      try {
        const length = await redisClient.lLen(key);
        const status = key.split(':').pop();
        console.log(`${status.toUpperCase()}: ${length} jobs`);
        
        // Show details for active jobs
        if (status === 'active' && length > 0) {
          const activeJobs = await redisClient.lRange(key, 0, -1);
          console.log(`  Active job IDs: ${activeJobs.join(', ')}`);
        }
        
        // Show details for failed jobs
        if (status === 'failed' && length > 0) {
          const failedJobs = await redisClient.lRange(key, 0, -1);
          console.log(`  Failed job IDs: ${failedJobs.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`${key}: Error checking queue`);
      }
    }
    
    // Show recent completed jobs
    console.log('\n=== Recent Completed Jobs ===');
    try {
      const completedJobs = await redisClient.lRange('bull:reminder-queue:completed', 0, 4);
      if (completedJobs.length > 0) {
        completedJobs.forEach((jobId, index) => {
          console.log(`  ${index + 1}. Job ID: ${jobId}`);
        });
      } else {
        console.log('  No completed jobs found');
      }
    } catch (error) {
      console.log('  Error retrieving completed jobs');
    }
    
    // Show job details if any active jobs
    console.log('\n=== Job Details ===');
    try {
      const activeJobs = await redisClient.lRange('bull:reminder-queue:active', 0, -1);
      if (activeJobs.length > 0) {
        for (const jobId of activeJobs) {
          try {
            const jobData = await redisClient.hGetAll(`bull:reminder-queue:${jobId}`);
            console.log(`\nJob ${jobId}:`);
            console.log(`  Type: ${jobData.name || 'Unknown'}`);
            console.log(`  Data: ${jobData.data || 'No data'}`);
            console.log(`  Progress: ${jobData.progress || '0'}%`);
          } catch (error) {
            console.log(`  Error getting details for job ${jobId}`);
          }
        }
      } else {
        console.log('  No active jobs');
      }
    } catch (error) {
      console.log('  Error retrieving job details');
    }
    
  } catch (error) {
    console.error('Error monitoring queue:', error);
  }
}

// Monitor in real-time
async function startMonitoring() {
  await connectRedis();
  
  // Initial check
  await monitorQueue();
  
  // Monitor every 5 seconds
  setInterval(async () => {
    console.log('\n' + '='.repeat(50));
    console.log(`Updated at: ${new Date().toLocaleTimeString()}`);
    await monitorQueue();
  }, 5000);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down Redis monitor...');
  await redisClient.quit();
  process.exit(0);
});

// Start monitoring
if (require.main === module) {
  startMonitoring().catch(console.error);
}

module.exports = { monitorQueue, connectRedis }; 