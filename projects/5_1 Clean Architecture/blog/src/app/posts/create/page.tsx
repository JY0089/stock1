'use client';

import { createPostAction } from '../../../presentation/actions/postActions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CreatePostPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createPostAction(formData);

        setLoading(false);

        if (!result.success) {
            setError(result.error);
        } else {
            router.push(`/posts/${result.post.id}`);
        }
    }

    return (
        <main className="container mx-auto py-8 max-w-2xl px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Post</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium leading-none">
                        Title (5-100 characters)
                    </label>
                    <Input
                        id="title"
                        name="title"
                        required
                        minLength={5}
                        maxLength={100}
                        placeholder="Awesome blog post title"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium leading-none">
                        Content (MDX formatting supported, 10-10000 characters)
                    </label>
                    <Textarea
                        id="content"
                        name="content"
                        required
                        minLength={10}
                        maxLength={10000}
                        className="min-h-[300px]"
                        placeholder="Write your post content here using Markdown..."
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Save Draft'}
                    </Button>
                </div>
            </form>
        </main>
    );
}
