import { getPostsAction, getMyDraftsAction } from '../../presentation/actions/postActions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
    const publishedPosts = await getPostsAction();
    const myDrafts = await getMyDraftsAction();

    return (
        <main className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
                <Link
                    href="/posts/create"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                    Create Post
                </Link>
            </div>

            <div className="space-y-12">
                {myDrafts.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">My Drafts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myDrafts.map((post) => (
                                <div key={post.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition bg-muted/20 hover:bg-muted/30">
                                    <h3 className="text-lg font-medium mb-2">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Status: <span className="text-yellow-600 font-medium">Draft</span>
                                    </p>
                                    <Link
                                        href={`/posts/${post.id}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Edit / Publish
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Published Posts</h2>
                    {publishedPosts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-10">No published posts yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publishedPosts.map((post) => (
                                <div key={post.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                                    <h3 className="text-lg font-medium mb-2">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                    <Link
                                        href={`/posts/${post.id}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Read more →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
