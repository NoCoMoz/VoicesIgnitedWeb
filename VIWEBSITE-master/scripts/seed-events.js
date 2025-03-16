const { MongoClient } = require('mongodb');

async function seedEvents() {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017/voicesignited');
    const db = client.db('voicesignited');

    // Create a test event
    const testEvent = {
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
      createdAt: new Date(),
      approvedAt: new Date(),
      approvedBy: "system"
    };

    // Insert the test event
    const result = await db.collection('events').insertOne(testEvent);
    console.log('Test event created:', result.insertedId);

    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedEvents();
