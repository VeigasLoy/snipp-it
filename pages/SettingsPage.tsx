import React, { useState, useRef, useEffect } from 'react';
import { User, Theme, Layout, Bookmark, Category, Folder, Label, Font } from '../types';
import { ICONS } from '../constants';
import Avatar from '../components/Avatar';
import { resetToDefaults } from '../lib/data';

type AppData = {
    bookmarks: Bookmark[];
    categories: Category[];
    folders: Folder[];
    labels: Label[];
    user: User;
}
interface SettingsPageProps {
    onClose: () => void;
    initialTab: string;
    user: User;
    setUser: (user: Partial<User>) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    layout: Layout;
    setLayout: (layout: Layout) => void;
    font: Font;
    setFont: (font: Font) => void;
    onImportData: (data: AppData) => void;
    onExportData: () => AppData;
    onClearData: () => void;
    updateUserName: (newName: string) => Promise<void>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, initialTab, user, setUser, theme, setTheme, layout, setLayout, font, setFont, onImportData, onExportData, onClearData, updateUserName }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [confirmClear, setConfirmClear] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [userName, setUserName] = useState(user.name);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

     useEffect(() => {
        setUserName(user.name);
    }, [user]);

    const handleSaveProfile = async () => {
        if (userName.trim() !== user.name) {
            await updateUserName(userName.trim());
            alert('Profile saved!');
        }
    };

    const handleExport = () => {
        const data = onExportData();
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `snippit_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleExportCSV = () => {
        const { bookmarks, folders, categories, labels } = onExportData();

        const escapeCsvCell = (cellData: any) => {
            const stringData = String(cellData || '');
            if (stringData.includes('"') || stringData.includes(',') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };
        
        const headers = ['ID', 'URL', 'Title', 'Description', 'Notes', 'Folder Name', 'Category Name', 'Labels', 'Created At', 'Visit Count', 'Last Visited At', 'Is Favorite'];
        const csvRows = [headers.join(',')];

        bookmarks.forEach(bookmark => {
            const folder = folders.find(f => f.id === bookmark.folderId);
            const category = folder ? categories.find(c => c.id === folder.categoryId) : undefined;
            const bookmarkLabels = labels.filter(l => bookmark.labels.includes(l.id)).map(l => l.name).join('; ');

            const row = [
                escapeCsvCell(bookmark.id),
                escapeCsvCell(bookmark.url),
                escapeCsvCell(bookmark.title),
                escapeCsvCell(bookmark.description),
                escapeCsvCell(bookmark.notes),
                escapeCsvCell(folder?.name),
                escapeCsvCell(category?.name),
                escapeCsvCell(bookmarkLabels),
                escapeCsvCell(bookmark.createdAt),
                bookmark.visitCount.toString(),
                escapeCsvCell(bookmark.lastVisitedAt),
                bookmark.isFavorite.toString()
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `snippit_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if(typeof text !== 'string') throw new Error("Invalid file content");
                const data = JSON.parse(text);
                // Add validation here if needed
                onImportData(data);
                alert('Data imported successfully!');
                onClose();
            } catch (error) {
                console.error("Failed to import data:", error);
                alert('Failed to import data. The file might be corrupted.');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        onClearData();
        setConfirmClear(false);
        alert('All data has been cleared.');
        onClose();
    };

    const handleResetToDefaults = async () => {
        try {
            await resetToDefaults(user.id);
            setConfirmReset(false);
            alert('Your data has been reset to the default configuration.');
        } catch (error) {
            console.error("Failed to reset data:", error);
            alert('An error occurred while trying to reset your data.');
        }
    };

    const TabButton = ({ id, label }: {id: string, label: string}) => (
        <button onClick={() => setActiveTab(id)} className={`px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${activeTab === id ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>
            {label}
        </button>
    );

    return (
       <div className="p-6 h-full flex flex-col">
            <div className="flex items-center mb-8 flex-shrink-0">
                <button onClick={onClose} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors mr-2">
                    <span className="sr-only">Back to dashboard</span>
                    {ICONS.arrowLeft}
                </button>
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <div className="flex-grow flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 mb-6 pb-6 md:mb-0 md:pb-0 border-b md:border-b-0 md:pr-8 md:border-r border-[var(--border-primary)]">
                    <div className="space-y-1">
                        <TabButton id="profile" label="Profile" />
                        <TabButton id="appearance" label="Appearance" />
                        <TabButton id="data" label="Data Management" />
                    </div>
                </div>
                <div className="w-full md:w-3/4 md:pl-8">
                    {activeTab === 'profile' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-6">Profile Settings</h3>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                  <Avatar name={userName} className="w-20 h-20 text-3xl flex-shrink-0"/>
                                  <p className="text-sm text-[var(--text-secondary)]">Your avatar is generated based on your name.</p>
                                </div>
                                <div>
                                    <label htmlFor="userName" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                                    <input type="text" id="userName" value={userName} onChange={e => setUserName(e.target.value)} className="w-full max-w-sm px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"/>
                                </div>
                                 <p className="text-sm text-[var(--text-secondary)]">To update your email or password, please visit your Firebase account settings.</p>

                                <div className="flex justify-start pt-2">
                                    <button onClick={handleSaveProfile} className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors">Save Profile</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'appearance' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-6">Appearance</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Theme</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.values(Theme)).map(t => <button key={t} onClick={() => setTheme(t)} className={`px-4 py-2 text-sm rounded-lg border capitalize ${theme === t ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-transparent border-[var(--border-primary)]'}`}>{t}</button>)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Default Layout</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.values(Layout)).map(l => <button key={l} onClick={() => setLayout(l)} className={`px-4 py-2 text-sm rounded-lg border capitalize ${layout === l ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-transparent border-[var(--border-primary)]'}`}>{l}</button>)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Font</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.values(Font)).map(f => <button key={f} onClick={() => setFont(f)} style={{fontFamily: `'${f}', sans-serif`}} className={`px-4 py-2 text-sm rounded-lg border ${font === f ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-transparent border-[var(--border-primary)]'}`}>{f}</button>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'data' && (
                        <div>
                            <h3 className="text-xl font-semibold mb-6">Data Management</h3>
                            <div className="space-y-3 max-w-sm">
                                <button onClick={handleExport} className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Export as JSON</button>
                                <button onClick={handleExportCSV} className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Export as CSV</button>
                                <button onClick={handleImportClick} className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Import from JSON</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden"/>
                            </div>

                            <div className="mt-8 p-4 border border-orange-500/30 rounded-lg max-w-sm">
                                <h4 className="font-semibold text-orange-500">Reset Data</h4>
                                <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3">This will reset your categories, folders, and labels to the default configuration. Bookmarks will not be affected.</p>
                                {!confirmReset ? (
                                    <button onClick={() => setConfirmReset(true)} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">Reset to Defaults</button>
                                ): (
                                    <div className="flex items-center space-x-3">
                                        <button onClick={handleResetToDefaults} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">Confirm Reset</button>
                                        <button onClick={() => setConfirmReset(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Cancel</button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 p-4 border border-red-500/30 rounded-lg max-w-sm">
                                <h4 className="font-semibold text-red-500">Danger Zone</h4>
                                <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3">This action cannot be undone. This will permanently delete all your bookmarks, folders, and categories.</p>
                                {!confirmClear ? (
                                    <button onClick={() => setConfirmClear(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Clear All Data</button>
                                ): (
                                    <div className="flex items-center space-x-3">
                                        <button onClick={handleClearData} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Confirm Deletion</button>
                                        <button onClick={() => setConfirmClear(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
