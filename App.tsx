import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './Dashboard';
import { User, Theme, Layout, Font } from './types';
import { ICONS } from './constants';
import { ToastProvider } from './components/ToastContext';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme as Theme : Theme.LIGHT;
    });
    
    const [layout, setLayout] = useState<Layout>(() => {
        const storedLayout = localStorage.getItem('layout');
        return storedLayout ? storedLayout as Layout : Layout.GRID;
    });

    const [font, setFont] = useState<Font>(() => {
        const storedFont = localStorage.getItem('font');
        return storedFont ? storedFont as Font : Font.INTER;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                
                const unsub = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || userData.name || 'User',
                            email: firebaseUser.email || userData.email,
                        });
                    } else {
                         setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'User',
                            email: firebaseUser.email || '',
                        });
                    }
                     setLoading(false);
                });
                
                return () => unsub();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.className = `theme-${theme}`;
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('layout', layout);
    }, [layout]);

    useEffect(() => {
        localStorage.setItem('font', font);
        document.body.style.fontFamily = `"${font}", sans-serif`;
    }, [font]);
    
    const handleSetUser = (newUserData: Partial<User>) => {
        if(user) {
            setUser(prevUser => ({...prevUser, ...newUserData} as User));
        }
    }

    const updateUserName = async (newName: string) => {
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: newName });
            handleSetUser({ name: newName });
        }
    };

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">{ICONS.loader}</div>;
    }

    return (
        <ToastProvider>
            {user ? (
                <Dashboard 
                    user={user} 
                    setUser={handleSetUser}
                    theme={theme}
                    setTheme={setTheme}
                    layout={layout}
                    setLayout={setLayout}
                    font={font}
                    setFont={setFont}
                    onLogout={() => auth.signOut()}
                    onPrivateFolderClick={() => {}}
                    updateUserName={updateUserName}
                />
            ) : isRegistering ? (
                <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />
            ) : (
                <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />
            )}
        </ToastProvider>
    );
};

export default App;
