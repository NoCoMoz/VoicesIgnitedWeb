const { MongoClient } = require('mongodb');

async function seedEvents() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect('mongodb://localhost:27017/voices_ignited');
    const db = client.db('voices_ignited');
    
    // Sample events matching our schema
    const events = [
      {
        title: "Community Workshop",
        description: "Join us for an engaging community workshop on social justice and activism.",
        date: new Date("2025-03-20"),
        startTime: "14:00",
        endTime: "16:00",
        type: "workshop",
        locationType: "in-person",
        location: "Community Center, 123 Main St",
        organizer: "Voices Ignited Team",
        contactEmail: "contact@voicesignited.org",
        approved: true,
        approvedBy: "system",
        approvedAt: new Date(),
        createdAt: new Date()
      },
      {
        title: "Monthly Planning Meeting",
        description: "Monthly meeting to discuss upcoming initiatives and community projects.",
        date: new Date("2025-03-25"),
        startTime: "18:30",
        endTime: "20:00",
        type: "meeting",
        locationType: "online",
        location: "Zoom (link will be sent)",
        organizer: "Core Team",
        contactEmail: "team@voicesignited.org",
        approved: true,
        approvedBy: "system",
        approvedAt: new Date(),
        createdAt: new Date()
      },
      {
        title: "Climate Action Rally",
        description: "Join us for a peaceful rally to raise awareness about climate change.",
        date: new Date("2025-04-05"),
        startTime: "10:00",
        endTime: "13:00",
        type: "action",
        locationType: "in-person",
        location: "City Hall Plaza",
        organizer: "Environmental Committee",
        contactEmail: "environment@voicesignited.org",
        approved: true,
        approvedBy: "system",
        approvedAt: new Date(),
        createdAt: new Date()
      }
    ];

    console.log('Inserting events...');
    const result = await db.collection('events').insertMany(events);
    console.log('Events created:', result.insertedIds);

    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedEvents();
