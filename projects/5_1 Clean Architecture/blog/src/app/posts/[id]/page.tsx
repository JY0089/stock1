import { diContainer } from '../../../presentation/di/container';
import { publishPostAction, deletePostAction } from '../../../presentation/actions/postActions';
import { MarkdownRenderer } from '@/components/mdx/MarkdownRenderer';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    let post;
    try {
        post = await diContainer.getPostUseCase.execute(id);
    } catch (error) {
        notFound();
    }

    const user = await diContainer.authService.getCurrentUser();
    const isAuthor = user?.id === post.authorId;
    const isAdmin = user?.isAdmin();
    const canEdit = isAuthor || isAdmin;

    // Check if it's draft and only author/admin can view it (enforce view rule simply here for demo)
    if (post.status === 'draft' && !canEdit) {
        return (
            <main className="container mx-auto py-8 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
                <p>You do not have permission to view this draft.</p>
                <Link href="/posts" className="text-blue-600 hover:underline">Back to posts</Link>
            </main>
        );
    }

    async function handlePublish() {
        'use server';
        await publishPostAction(post.id);
    }

    async function handleDelete() {
        'use server';
        await deletePostAction(post.id);
        redirect('/posts');
    }

    return (
        <main className="container mx-auto py-8 max-w-3xl px-4">
            <div className="mb-8">
                <Link href="/posts" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
                    ← Back to posts
                </Link>
                <div className="flex justify-between items-start gap-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
                    {post.status === 'draft' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">
                            Draft
                        </span>
                    )}
                </div>
                <p className="text-muted-foreground mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="mb-12">
                <MarkdownRenderer content={post.content} />
            </div>

            {canEdit && post.status !== 'archived' && (
                <div className="border-t pt-6 mt-8">
                    <h3 className="text-lg font-medium mb-4">Author Actions</h3>
                    <div className="flex gap-4">
                        {post.status === 'draft' && (
                            <form action={handlePublish}>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                                    Publish Post
                                </Button>
                            </form>
                        )}
                        <form action={handleDelete}>
                            <Button type="submit" variant="destructive">
                                Delete (Archive)
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
