import { useState, useEffect } from 'react';
import { db } from '../firebase.ts';
import { collection, doc, writeBatch, onSnapshot, query, addDoc } from 'firebase/firestore';

export function useFirestore<T extends { id: string }>(collectionName: string, userId: string | null) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setData([]);
            setLoading(false);
            return;
        }

        const collectionRef = collection(db, 'users', userId, collectionName);
        setLoading(true);
        const q = query(collectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            setData(documents);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, collectionName]);

    const add = async (item: Omit<T, 'id'>) => {
        if (!userId) return;
        const collectionRef = collection(db, 'users', userId, collectionName);
        try {
            const docRef = await addDoc(collectionRef, item);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
            setError(e as Error);
        }
    };

    const update = async (id: string, item: Partial<T>) => {
        if (!userId) return;
        const collectionRef = collection(db, 'users', userId, collectionName);
        try {
            const batch = writeBatch(db);
            const docRef = doc(collectionRef, id);
            batch.update(docRef, item as any);
            await batch.commit();
        } catch (e) {
            console.error("Error updating document: ", e);
            setError(e as Error);
        }
    };

    const remove = async (id: string) => {
        if (!userId) return;
        const collectionRef = collection(db, 'users', userId, collectionName);
        try {
            const batch = writeBatch(db);
            const docRef = doc(collectionRef, id);
            batch.delete(docRef);
            await batch.commit();
        } catch (e) {
            console.error("Error deleting document: ", e);
            setError(e as Error);
        }
    };
    
    const bulkUpdate = async (ids: string[], updates: Partial<T>) => {
        if (!userId || ids.length === 0) return;
        const collectionRef = collection(db, 'users', userId, collectionName);
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(collectionRef, id);
                batch.update(docRef, updates as any);
            });
            await batch.commit();
        } catch (e) {
            console.error("Error bulk updating documents: ", e);
            setError(e as Error);
        }
    };

    const bulkAdd = async (items: Omit<T, 'id'>[]) => {
        if (!userId || items.length === 0) return;
        const collectionRef = collection(db, 'users', userId, collectionName);
        try {
            const batch = writeBatch(db);
            items.forEach(item => {
                const docRef = doc(collectionRef);
                batch.set(docRef, item);
            });
            await batch.commit();
        } catch (e) {
            console.error("Error bulk adding documents: ", e);
            setError(e as Error);
        }
    };

    const bulkDelete = async (ids: string[]) => {
        if (!userId || ids.length === 0) return;
        const collectionRef = collection(db, 'users', userId, collectionName);
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const docRef = doc(collectionRef, id);
                batch.delete(docRef);
            });
            await batch.commit();
        } catch (e) {
            console.error("Error bulk deleting documents: ", e);
            setError(e as Error);
        }
    };

    return { data, loading, error, add, update, remove, bulkUpdate, bulkAdd, bulkDelete };
}
