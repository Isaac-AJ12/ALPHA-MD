const fs = require('fs');
const path = require('path');

// Function to clean up session files that might be causing conflicts
function cleanupSessions() {
  const sessionsDir = path.join(__dirname, 'sessions');
  
  // Check if the sessions directory exists
  if (!fs.existsSync(sessionsDir)) {
    console.log('No sessions directory found. Skipping cleanup.');
    return;
  }
  
  console.log('Cleaning up session files...');
  
  try {
    // Read all files in the sessions directory
    const files = fs.readdirSync(sessionsDir);
    
    // Look for specific session files that might be causing conflicts
    const conflictFiles = files.filter(file => 
      file.endsWith('.json') && 
      (file.includes('session') || file.includes('creds'))
    );
    
    if (conflictFiles.length > 0) {
      console.log(`Found ${conflictFiles.length} potential conflict files.`);
      
      // Backup the files before deleting
      const backupDir = path.join(__dirname, 'sessions-backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Create timestamped backup directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedBackupDir = path.join(backupDir, timestamp);
      fs.mkdirSync(timestampedBackupDir);
      
      // Backup and delete conflict files
      conflictFiles.forEach(file => {
        const filePath = path.join(sessionsDir, file);
        const backupPath = path.join(timestampedBackupDir, file);
        
        // Copy file to backup
        fs.copyFileSync(filePath, backupPath);
        
        // Delete the original file
        fs.unlinkSync(filePath);
        console.log(`Backed up and removed: ${file}`);
      });
      
      console.log('Session cleanup completed successfully.');
    } else {
      console.log('No conflict files found. Skipping cleanup.');
    }
  } catch (error) {
    console.error('Error during session cleanup:', error);
  }
}

// Export the cleanup function
module.exports = { cleanupSessions };

// If this script is run directly, perform cleanup
if (require.main === module) {
  cleanupSessions();
}
