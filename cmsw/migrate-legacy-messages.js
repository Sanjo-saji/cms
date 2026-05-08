import connectdb from "./config/connectiondb.js";
import Chat from "./model/chat/chat.model.js";
import { generateAnonymousId } from "./utils/anonymousId.js";

async function migrateLegacyMessages() {
  try {
    console.log('🔄 Starting legacy message migration...');
    
    // Connect to database
    await connectdb();
    console.log('✅ Database connected successfully');
    
    // Find all chat documents
    const chats = await Chat.find({});
    console.log(`📚 Found ${chats.length} chat documents`);
    
    let totalMessages = 0;
    let migratedMessages = 0;
    let addedAnonIds = 0;
    
    for (const chat of chats) {
      if (chat.students && chat.students.length > 0) {
        for (const student of chat.students) {
          // Check if student entry has anonId
          if (!student.anonId) {
            student.anonId = generateAnonymousId();
            addedAnonIds++;
            console.log(`🆔 Added missing anonId: ${student.anonId}`);
          }
          
          if (student.messages && student.messages.length > 0) {
            totalMessages += student.messages.length;
            
            for (const message of student.messages) {
              // Check if message needs migration
              if (!message.sender || !message.text) {
                if (message.s) {
                  message.sender = 'student';
                  message.text = message.s;
                  migratedMessages++;
                  console.log(`🔄 Migrated student message: "${message.s}"`);
                } else if (message.t) {
                  message.sender = 'teacher';
                  message.text = message.t;
                  migratedMessages++;
                  console.log(`🔄 Migrated teacher message: "${message.t}"`);
                } else {
                  // If no legacy fields, set defaults
                  message.sender = 'unknown';
                  message.text = 'Legacy message';
                  migratedMessages++;
                  console.log(`🔄 Set default for legacy message`);
                }
              }
            }
          }
        }
      }
    }
    
    if (migratedMessages > 0 || addedAnonIds > 0) {
      console.log(`💾 Saving ${chats.length} updated chat documents...`);
      
      // Save all updated documents
      for (const chat of chats) {
        await chat.save();
      }
      
      console.log(`✅ Successfully migrated ${migratedMessages} messages and added ${addedAnonIds} anonIds in ${chats.length} chat documents`);
    } else {
      console.log('✅ No changes needed');
    }
    
    console.log(`📊 Migration Summary:`);
    console.log(`   Total chat documents: ${chats.length}`);
    console.log(`   Total messages: ${totalMessages}`);
    console.log(`   Migrated messages: ${migratedMessages}`);
    console.log(`   Added anonIds: ${addedAnonIds}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close connection
    process.exit(0);
  }
}

// Run the migration
migrateLegacyMessages().catch(console.error);
