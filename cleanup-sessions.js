const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Function to clean up session files that might be causing conflicts
function cleanupSessions() {
  const authDir = path.join(__dirname, 'auth');
  
  // Check if the auth directory exists
  if (!fs.existsSync(authDir)) {
    console.log('No auth directory found. Skipping cleanup.');
    return;
  }
  
  console.log('Cleaning up session files...');
  
  try {
    // Read all files in the auth directory
    const files = fs.readdirSync(authDir);
    
    // Get owner number from environment variable
    const ownerNumber = process.env.NUMBERO_ONWER || '';
    
    // Look for specific session files matching the pattern session-{env.NUMBERO_ONWER}.*.json
    const conflictFiles = files.filter(file => 
      file.endsWith('.json') && 
      file.startsWith(`session-${ownerNumber}`)
    );
    
    if (conflictFiles.length > 0) {
      console.log(`Found ${conflictFiles.length} potential conflict files.`);
      
      // Backup the files before deleting
      const backupDir = path.join(__dirname, 'auth-backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Create timestamped backup directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedBackupDir = path.join(backupDir, timestamp);
      fs.mkdirSync(timestampedBackupDir);
      
      // Backup and delete conflict files
      conflictFiles.forEach(file => {
        const filePath = path.join(authDir, file);
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
