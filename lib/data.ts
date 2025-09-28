import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { INITIAL_CATEGORIES, INITIAL_FOLDERS, INITIAL_LABELS, INITIAL_BOOKMARKS } from '../constants';

/**
 * Populates or resets the user's database with the initial set of
 * categories, folders, and labels from `constants.tsx`.
 * This operation is idempotent. It will overwrite existing data
 * with the same IDs.
 * @param userId - The ID of the user to seed data for.
 */
export async function seedInitialData(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("A user ID must be provided to seed data.");
    }

    console.log(`Seeding initial data for user: ${userId}`);
    const batch = writeBatch(db);

    // Set Categories
    INITIAL_CATEGORIES.forEach(category => {
        const categoryRef = doc(db, 'users', userId, 'categories', category.id);
        batch.set(categoryRef, { name: category.name });
    });

    // Set Folders
    INITIAL_FOLDERS.forEach(folder => {
        const folderRef = doc(db, 'users', userId, 'folders', folder.id);
        const folderData = { ...folder };
        batch.set(folderRef, folderData);
    });

    // Set Labels
    INITIAL_LABELS.forEach(label => {
        const labelRef = doc(db, 'users', userId, 'labels', label.id);
        batch.set(labelRef, { name: label.name });
    });
    
    // Set Bookmarks (currently empty, but good to have for future)
    INITIAL_BOOKMARKS.forEach(bookmark => {
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
        const bookmarkData = { ...bookmark };
        batch.set(bookmarkRef, bookmarkData);
    });

    await batch.commit();
    console.log(`Successfully seeded initial data for user: ${userId}`);
}


/**
 * Resets the user's database to the default set of categories, folders, and labels.
 * This involves deleting all existing data and then seeding the initial data.
 * @param userId - The ID of the user to reset data for.
 */
export async function resetToDefaults(userId: string): Promise<void> {
    if (!userId) {
        throw new Error("A user ID must be provided to reset data.");
    }

    console.log(`Resetting data for user: ${userId}`);

    const collectionsToDelete = ['categories', 'folders', 'labels', 'bookmarks'];

    // Delete all documents in each collection
    for (const collectionName of collectionsToDelete) {
        const collectionRef = collection(db, 'users', userId, collectionName);
        const snapshot = await getDocs(collectionRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    // Seed the initial data
    await seedInitialData(userId);

    console.log(`Successfully reset data for user: ${userId}`);
}
