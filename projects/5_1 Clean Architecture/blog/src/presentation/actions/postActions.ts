'use server';

import { diContainer } from '../di/container';
import { revalidatePath } from 'next/cache';
import { ApplicationError } from '../../domain/exceptions/errors';

export async function createPostAction(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    try {
        const post = await diContainer.createPostUseCase.execute({ title, content });
        revalidatePath('/posts');

        // Convert to plain object to pass to client components
        return { success: true, post: { id: post.id, status: post.status } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function publishPostAction(id: string) {
    try {
        await diContainer.publishPostUseCase.execute(id);
        revalidatePath('/posts');
        revalidatePath(`/posts/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePostAction(id: string) {
    try {
        await diContainer.deletePostUseCase.execute(id);
        revalidatePath('/posts');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPostsAction() {
    const posts = await diContainer.getPostsUseCase.execute({ status: 'published' });
    return posts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        status: p.status,
        createdAt: p.createdAt,
        authorId: p.authorId,
    }));
}

export async function getMyDraftsAction() {
    const user = await diContainer.authService.getCurrentUser();
    if (!user) return [];
    const posts = await diContainer.getPostsUseCase.execute({ authorId: user.id, status: 'draft' });
    return posts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        status: p.status,
        createdAt: p.createdAt,
        authorId: p.authorId,
    }));
}
