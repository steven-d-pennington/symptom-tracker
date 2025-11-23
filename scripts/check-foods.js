// Script to check if foods are seeded in IndexedDB
// Run in browser console after opening the app

async function checkFoods() {
  const Dexie = window.Dexie;
  const db = new Dexie('symptom-tracker');
  
  // Open the database
  await db.open();
  
  // Get all foods
  const foods = await db.table('foods').toArray();
  console.log(`Total foods in database: ${foods.length}`);
  
  // Check for sentinel
  const sentinel = await db.table('foods')
    .where('name')
    .equals('__SEED_COMPLETE_V1__')
    .toArray();
  console.log(`Sentinel records found: ${sentinel.length}`);
  
  // Get user
  const users = await db.table('users').toArray();
  console.log(`Users in database: ${users.length}`);
  if (users.length > 0) {
    console.log(`User ID: ${users[0].id}`);
    
    // Check foods for that user
    const userFoods = await db.table('foods')
      .where('userId')
      .equals(users[0].id)
      .toArray();
    console.log(`Foods for user: ${userFoods.length}`);
    
    // Check default foods
    const defaultFoods = userFoods.filter(f => f.isDefault && f.isActive);
    console.log(`Default active foods: ${defaultFoods.length}`);
    
    // Sample some foods
    console.log('\nSample foods:');
    userFoods.slice(0, 5).forEach(f => {
      console.log(`- ${f.name} (${f.category}) [default: ${f.isDefault}, active: ${f.isActive}]`);
    });
  }
  
  db.close();
}

checkFoods().catch(console.error);
