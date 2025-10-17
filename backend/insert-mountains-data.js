const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://ednzkmajmerlvuwptnti.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
  || process.env.SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbnprbWFqbWVybHZ1d3B0bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDcwNTUsImV4cCI6MjA3NTEyMzA1NX0.LPnXAC8K-dZcERJgmq2Fq42x4EtL_n8920FB0fbbES4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Additional mountain data to insert
const additionalMountains = [
  {
    name: 'Mount Makiling',
    elevation: 1090,
    location: 'Laguna',
    difficulty: 'Moderate',
    description: 'A dormant volcano known for its biodiversity and research facilities.'
  },
  {
    name: 'Mount Banahaw',
    elevation: 2158,
    location: 'Quezon',
    difficulty: 'Hard',
    description: 'Sacred mountain with spiritual significance and challenging trails.'
  },
  {
    name: 'Mount Daraitan',
    elevation: 739,
    location: 'Rizal',
    difficulty: 'Easy',
    description: 'Popular hiking destination with limestone formations and Tinipak River.'
  },
  {
    name: 'Mount Tapulao',
    elevation: 2037,
    location: 'Zambales',
    difficulty: 'Hard',
    description: 'The highest peak in Zambales, known for its pine forests.'
  },
  {
    name: 'Mount Ulap',
    elevation: 1846,
    location: 'Benguet',
    difficulty: 'Moderate',
    description: 'Known for its rolling hills and scenic grasslands.'
  },
  {
    name: 'Mount Manalmon',
    elevation: 196,
    location: 'Bulacan',
    difficulty: 'Easy',
    description: 'Perfect for beginners with caves and river activities.'
  },
  {
    name: 'Mount Pico de Loro',
    elevation: 664,
    location: 'Cavite',
    difficulty: 'Moderate',
    description: 'Famous for its parrot beak rock formation and coastal views.'
  },
  {
    name: 'Mount Maculot',
    elevation: 930,
    location: 'Batangas',
    difficulty: 'Moderate',
    description: 'Known for its three peaks: The Grotto, The Rockies, and The Summit.'
  },
  {
    name: 'Mount Gulugod Baboy',
    elevation: 525,
    location: 'Batangas',
    difficulty: 'Easy',
    description: 'Easy hike with beautiful views of Batangas Bay and Verde Island.'
  },
  {
    name: 'Mount Romelo',
    elevation: 300,
    location: 'Laguna',
    difficulty: 'Easy',
    description: 'Popular for its waterfalls and swimming holes.'
  },
  {
    name: 'Mount Halcon',
    elevation: 2582,
    location: 'Mindoro Oriental',
    difficulty: 'Expert',
    description: 'One of the most challenging peaks in the Philippines with dense forests.'
  },
  {
    name: 'Mount Guiting-Guiting',
    elevation: 2058,
    location: 'Romblon',
    difficulty: 'Expert',
    description: 'Known for its jagged peaks and technical climbing sections.'
  },
  {
    name: 'Mount Mantalingajan',
    elevation: 2085,
    location: 'Palawan',
    difficulty: 'Hard',
    description: 'The highest peak in Palawan with diverse wildlife and ecosystems.'
  },
  {
    name: 'Mount Kanlaon',
    elevation: 2435,
    location: 'Negros Occidental',
    difficulty: 'Hard',
    description: 'Active volcano with sulfuric vents and challenging terrain.'
  },
  {
    name: 'Mount Hibok-Hibok',
    elevation: 1332,
    location: 'Camiguin',
    difficulty: 'Moderate',
    description: 'Active volcano with hot springs and beautiful crater lake.'
  }
];

async function insertMountains() {
  try {
    console.log('🚀 Starting to insert mountain data...');
    
    // Check if mountains already exist
    const { data: existingMountains, error: fetchError } = await supabase
      .from('mountains')
      .select('name');
    
    if (fetchError) {
      console.error('❌ Error fetching existing mountains:', fetchError);
      return;
    }
    
    const existingNames = existingMountains.map(m => m.name);
    console.log(`📊 Found ${existingNames.length} existing mountains`);
    
    // Filter out mountains that already exist
    const newMountains = additionalMountains.filter(mountain => 
      !existingNames.includes(mountain.name)
    );
    
    if (newMountains.length === 0) {
      console.log('✅ All mountains already exist in the database');
      return;
    }
    
    console.log(`🆕 Inserting ${newMountains.length} new mountains...`);
    
    // Insert new mountains
    const { data: insertedMountains, error: insertError } = await supabase
      .from('mountains')
      .insert(newMountains)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting mountains:', insertError);
      return;
    }
    
    console.log('✅ Successfully inserted mountains:');
    insertedMountains.forEach(mountain => {
      console.log(`   - ${mountain.name} (${mountain.elevation}m, ${mountain.location}, ${mountain.difficulty})`);
    });
    
    console.log(`\n🎉 Total mountains in database: ${existingNames.length + insertedMountains.length}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
insertMountains();
