import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Use the same collections as the users management page
const USER_COLLECTIONS = [
  'users',
  'players',
  'academies', 'academy',
  'clubs', 'club',
  'trainers', 'trainer',
  'agents', 'agent',
  'marketers', 'marketer',
  'parents', 'parent'
];

export async function GET(request: NextRequest) {
  console.log('🔍 API: Starting user count fetch...');
  
  try {
    const allUsersMap = new Map<string, any>();
    const collectionStats: Record<string, number> = {};

    for (const collectionName of USER_COLLECTIONS) {
      try {
        console.log(`🔍 Fetching from collection: ${collectionName}`);
        
        // Get all users from the collection
        const allUsersSnapshot = await getDocs(collection(db, collectionName));
        const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        collectionStats[collectionName] = allUsers.length;
        
        // Add users to map, avoiding duplicates (users collection takes precedence)
        allUsers.forEach(user => {
          if (!allUsersMap.has(user.id) || collectionName === 'users') {
            allUsersMap.set(user.id, user);
          }
        });
        
        console.log(`✅ Collection ${collectionName}: ${allUsers.length} total users`);
      } catch (collectionError) {
        console.warn(`❌ Error fetching from collection ${collectionName}:`, collectionError);
        collectionStats[collectionName] = 0;
        // Continue with other collections even if one fails
      }
    }

    // Count unique users
    const uniqueUsers = Array.from(allUsersMap.values());
    const activeUsers = uniqueUsers.filter(user => user.isDeleted !== true).length;
    const deletedUsers = uniqueUsers.filter(user => user.isDeleted === true).length;
    const totalUsers = uniqueUsers.length;

    console.log(`📊 Final stats - Total: ${totalUsers}, Active: ${activeUsers}, Deleted: ${deletedUsers}`);
    console.log(`📊 Collection breakdown:`, collectionStats);

    return NextResponse.json({
      success: true,
      message: 'Total user count fetched successfully',
      data: {
        totalUsers: activeUsers, // Return active users as total
        totalIncludingDeleted: totalUsers,
        deletedUsers,
        collectionStats,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching total user count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch total user count' },
      { status: 500 }
    );
  }
}
