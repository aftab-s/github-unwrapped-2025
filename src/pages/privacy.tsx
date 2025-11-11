import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - GitHub Unwrapped 2025</title>
      </Head>

      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-block mb-6 opacity-75 hover:opacity-100 transition-opacity">
            ← Back to Home
          </Link>

          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-lg opacity-90">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Data We Collect</h2>
              <p>
                GitHub Unwrapped 2025 fetches publicly available data from GitHub's API, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Public contributions (commits, pull requests, issues)</li>
                <li>Public repository information</li>
                <li>Programming language usage</li>
                <li>Contribution calendar for 2025</li>
              </ul>
              <p className="mt-3">
                If you sign in with GitHub OAuth, we may access private repository data only with your
                explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Storage</h2>
              <p>
                We cache fetched GitHub data temporarily to improve performance and reduce API load.
                Cached data is stored for up to 24 hours and includes only the statistics displayed
                on your card.
              </p>
              <p className="mt-2">
                We do <strong>not</strong> store:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>GitHub access tokens (OAuth tokens are stored in httpOnly cookies only)</li>
                <li>Personal identifying information beyond GitHub usernames</li>
                <li>Any data not displayed on the public card</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Data Deletion</h2>
              <p>
                You can request deletion of your cached data at any time by clicking the button below.
                This will remove all cached statistics associated with your username.
              </p>
              <DeleteDataButton />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
              <p>This application uses:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>GitHub API</strong> - for fetching user statistics</li>
                <li><strong>Upstash/Vercel KV</strong> (optional) - for caching</li>
              </ul>
              <p className="mt-3">
                Please refer to <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="underline">GitHub's Privacy Policy</a> for more information about how GitHub handles your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact</h2>
              <p>
                If you have any questions about this privacy policy or your data, please open an issue
                on our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function DeleteDataButton() {
  const [username, setUsername] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleDelete = async () => {
    if (!username.trim()) {
      setMessage('Please enter a username');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your cached data has been deleted successfully.');
        setUsername('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to delete data');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="mt-4 p-6 bg-white/5 rounded-lg">
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your GitHub username"
          className="flex-1 px-4 py-2 rounded bg-white/10 border border-white/20 outline-none focus:border-white/40"
        />
        <button
          onClick={handleDelete}
          disabled={status === 'loading'}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Deleting...' : 'Delete My Data'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

// Import React for the button component
import React from 'react';
