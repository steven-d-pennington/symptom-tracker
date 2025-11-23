import Link from "next/link";
import { ArrowLeft, Download, Upload, Shield, Cloud, Lock, RefreshCw, AlertCircle } from "lucide-react";

export default function SyncAndBackupPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Help Center
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-3">Sync & Backup</h1>
                <p className="text-lg text-muted-foreground">
                    Protect your data with Zero-Knowledge Cloud Sync and manual backups
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Zero-Knowledge Cloud Sync</h2>
                <p className="text-muted-foreground">
                    Pocket Symptom Tracker offers an optional cloud sync feature that allows you to back up your data securely.
                    We use a <strong>Zero-Knowledge</strong> approach, which means:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                    <li><strong>🔒 You hold the keys:</strong> Your data is encrypted on your device using a key that only you have.</li>
                    <li><strong>☁️ We can't see your data:</strong> The server only stores encrypted "blobs" of data. We cannot read your symptoms, notes, or photos.</li>
                    <li><strong>🔄 Cross-Device Sync:</strong> You can restore your data on a new device by entering your unique Sync Key.</li>
                </ul>

                <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6 mb-8">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Important: Save Your Sync Key!
                            </p>
                            <p className="text-blue-800 dark:text-blue-200">
                                Because we don't store your password, <strong>we cannot recover your data if you lose your Sync Key</strong>.
                                Please write it down or store it in a password manager.
                            </p>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mt-6 mb-3">How to Enable Sync</h3>
                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                    <li>Go to <strong>Settings</strong> {'>'} <strong>Sync & Backup</strong>.</li>
                    <li>Click <strong>"Enable Cloud Sync"</strong>.</li>
                    <li>You will be given a unique <strong>Sync Key</strong>. Save this immediately.</li>
                    <li>The app will automatically encrypt and upload your data in the background.</li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Manual Backup (Import/Export)</h2>
                <p className="text-muted-foreground">
                    If you prefer not to use the cloud, or want an extra layer of safety, you can manually export your data.
                </p>

                <div className="space-y-4 mt-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Download className="w-4 h-4 text-primary" />
                            Exporting Data
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Go to <strong>Settings {'>'} Export Data</strong>. This will download a JSON file containing all your health history.
                            Store this file securely on your computer or external drive.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-primary" />
                            Importing Data
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            To restore data, go to <strong>Settings {'>'} Import Data</strong> and select your backup JSON file.
                            The app will validate the file and merge it with your existing data.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Privacy & Security FAQ</h2>

                <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h4 className="font-semibold text-foreground mb-1">Where is my data stored?</h4>
                        <p className="text-sm text-muted-foreground">
                            By default, 100% of your data lives on your device (in your browser). If you enable Cloud Sync, an encrypted copy is stored on our secure servers.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h4 className="font-semibold text-foreground mb-1">Can you sell my health data?</h4>
                        <p className="text-sm text-muted-foreground">
                            No. Because of Zero-Knowledge Encryption, we technically cannot read your health data, so we couldn't sell it even if we wanted to (which we don't).
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
                <div className="grid md:grid-cols-2 gap-3">
                    <Link href="/help/managing-data" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                        <h3 className="font-semibold text-foreground text-sm mb-1">Managing Data</h3>
                        <p className="text-xs text-muted-foreground">Edit or delete individual records</p>
                    </Link>
                    <Link href="/about" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                        <h3 className="font-semibold text-foreground text-sm mb-1">About Privacy</h3>
                        <p className="text-xs text-muted-foreground">Our commitment to user privacy</p>
                    </Link>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
                <Link href="/help/managing-data" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Previous: Managing Data
                </Link>
                <Link href="/help" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                    Back to Help Center
                </Link>
            </div>
        </div>
    );
}
