const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

if (!process.env.MONGODB_URI) {
  console.log("No MONGODB_URI found");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const User = require('./src/models/User');
    const users = await User.find({});
    const usernameCounts = {};
    const duplicates = [];

    users.forEach(user => {
      const uname = user.username.toLowerCase();
      usernameCounts[uname] = (usernameCounts[uname] || 0) + 1;
    });

    for (const [uname, count] of Object.entries(usernameCounts)) {
      if (count > 1) duplicates.push(uname);
    }

    console.log('Total Users:', users.length);
    console.log('Duplicate Usernames:', duplicates);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
