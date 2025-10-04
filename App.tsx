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
    const [droppedUrl, setDroppedUrl] = useState<string | null>(null);
    const [droppedHtmlContent, setDroppedHtmlContent] = useState<string | null>(null); // New state for dropped HTML
    const [isDragging, setIsDragging] = useState(false); 

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

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.types.includes('text/uri-list') || event.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
            console.log('Drag over detected, setting isDragging to true');
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false); // Reset dragging state on drop
        console.log('File dropped.');

        let url = event.dataTransfer.getData('URL');
        // Ensure url is a string, if not, set it to an empty string
        if (typeof url !== 'string') {
            url = '';
        }

        if (url) {
            console.log('Dropped URL:', url);
            setDroppedUrl(url);
            setDroppedHtmlContent(null); // Clear HTML content if a URL is dropped
            return;
        }

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            console.log('Dropped file detected. File type:', file.type);

            if (file.type === 'text/html') {
                console.log('Dropped file is HTML. Reading content...');
                const reader = new FileReader();
                reader.onload = (e) => {
                    const html = e.target?.result as string;
                    console.log('HTML content read. Length:', html.length);
                    setDroppedHtmlContent(html);
                    setDroppedUrl(null); // Clear URL if HTML is dropped
                };
                reader.readAsText(file);
            } else {
                console.warn('Dropped file is not an HTML file:', file.type);
            }
        }
    };

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">{ICONS.loader}</div>;
    }

    return (
        <ToastProvider>
            <div 
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onDrop={handleDrop} 
                className="min-h-screen w-full relative" 
            >
                {isDragging && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="p-8 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border-2 border-dashed border-[var(--accent-primary)] flex flex-col items-center justify-center space-y-4 shadow-lg">
                            {ICONS.upload}
                            <p className="text-lg font-semibold">Drop URL or HTML file here to create a new bookmark</p>
                        </div>
                    </div>
                )}
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
                        droppedUrl={droppedUrl}
                        setDroppedUrl={setDroppedUrl}
                        droppedHtmlContent={droppedHtmlContent}
                        setDroppedHtmlContent={setDroppedHtmlContent}
                    />
                ) : isRegistering ? (
                    <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />
                ) : (
                    <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />
                )}
            </div>
        </ToastProvider>
    );
};

export default App;
