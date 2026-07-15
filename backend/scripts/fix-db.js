const mongoose = require('mongoose');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("No MONGODB_URI found in environment");
    process.exit(1);
  }

  console.log("Connecting to database...");
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected. Checking for duplicate usernames...");

    const User = require('../src/models/User');
    const users = await User.find({});
    
    // Map to keep track of seen usernames
    const seenUsernames = new Map();

    for (const user of users) {
      // Lowercase for case-insensitive check
      const lowerUsername = user.username ? user.username.toLowerCase() : `user_${Date.now()}`;
      
      if (!seenUsernames.has(lowerUsername)) {
        seenUsernames.set(lowerUsername, 1);
        
        // If they had weird casing, let's normalize it to lowercase
        // or just ensure they don't have spaces
        const fixedUsername = lowerUsername.replace(/\s+/g, '');
        if (user.username !== fixedUsername) {
          user.username = fixedUsername;
          await user.save();
          console.log(`Normalized username to: ${fixedUsername}`);
        }
      } else {
        const count = seenUsernames.get(lowerUsername);
        seenUsernames.set(lowerUsername, count + 1);
        
        // This is a duplicate! Rename it.
        const newUsername = `${lowerUsername.replace(/\s+/g, '')}_${count}`;
        user.username = newUsername;
        await user.save();
        console.log(`Renamed duplicate user to: ${newUsername}`);
      }
    }

    console.log("Checking for duplicate emails...");
    const seenEmails = new Map();
    for (const user of users) {
      if (!user.email) continue;
      const lowerEmail = user.email.toLowerCase();
      if (!seenEmails.has(lowerEmail)) {
        seenEmails.set(lowerEmail, 1);
      } else {
        const count = seenEmails.get(lowerEmail);
        seenEmails.set(lowerEmail, count + 1);
        
        // Rename duplicate email to avoid crash when unique index is created
        const newEmail = `dup_${count}_${lowerEmail}`;
        user.email = newEmail;
        await user.save();
        console.log(`Renamed duplicate email to: ${newEmail}`);
      }
    }

    // After cleanup, we can tell MongoDB to sync indexes based on our Schema
    // This will force creation of the unique index on username
    console.log("Syncing indexes to enforce unique constraints...");
    await User.syncIndexes();
    
    console.log("Database cleanup complete!");
    process.exit(0);

  } catch (error) {
    console.error("Failed during database cleanup:", error);
    process.exit(1);
  }
}

run();
