export type PostStatus = 'draft' | 'published' | 'archived';

export interface CreatePostProps {
    id: string;
    authorId: string;
    title: string;
    content: string;
    status?: PostStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Post {
    public readonly id: string;
    public readonly authorId: string;
    private _title: string;
    private _content: string;
    private _status: PostStatus;
    public readonly createdAt: Date;
    public updatedAt: Date;

    constructor(props: CreatePostProps) {
        this.id = props.id;
        this.authorId = props.authorId;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
        this._status = props.status || 'draft';

        this.setTitle(props.title);
        this.setContent(props.content);
    }

    get title(): string {
        return this._title;
    }

    get content(): string {
        return this._content;
    }

    get status(): PostStatus {
        return this._status;
    }

    public setTitle(title: string): void {
        if (title.length < 5 || title.length > 100) {
            throw new Error(`Title must be between 5 and 100 characters. Length is ${title.length}`);
        }
        this._title = title;
        this.markUpdated();
    }

    public setContent(content: string): void {
        if (content.length < 10 || content.length > 10000) {
            throw new Error(`Content must be between 10 and 10000 characters. Length is ${content.length}`);
        }
        this._content = content;
        this.markUpdated();
    }

    public publish(): void {
        if (this._status === 'archived') {
            throw new Error("Cannot publish an archived post.");
        }
        this._status = 'published';
        this.markUpdated();
    }

    public archive(): void {
        this._status = 'archived';
        this.markUpdated();
    }

    public canBeEditedBy(userId: string, isAdmin: boolean): boolean {
        if (isAdmin) return true;
        return this.authorId === userId;
    }

    public isDraft(): boolean {
        return this._status === 'draft';
    }

    private markUpdated(): void {
        this.updatedAt = new Date();
    }
}
