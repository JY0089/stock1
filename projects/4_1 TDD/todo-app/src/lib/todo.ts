export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

export class TodoManager {
    private todos: Todo[] = [];

    constructor(initialTodos: Todo[] = []) {
        // 깊은 복사나 안전한 배열 복사를 수행
        this.todos = [...initialTodos];
    }

    addTodo(title: string): Todo {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            throw new Error('제목은 비어있을 수 없습니다');
        }

        const newTodo: Todo = {
            // Node.js < 19 이거나 jsdom 환경일 경우 randomUUID가 없을 수 있으므로 폴백 적용
            id: typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 11),
            title: trimmedTitle,
            completed: false,
            createdAt: new Date(),
        };

        this.todos.push(newTodo);
        return newTodo;
    }

    getTodos(): Todo[] {
        // 불변성을 유지하기 위해 복사본 반환
        // 얕은 복사본이지만, Todo는 기본 타입들로만 이루어져 있으므로 spread operator로 충분함.
        return this.todos.map(todo => ({ ...todo }));
    }

    toggleTodo(id: string): Todo {
        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex === -1) {
            throw new Error(`할 일(${id})을 찾을 수 없습니다`);
        }

        // 객체의 불변성을 유지하기 위해 새로 할당 (Redux 패턴 등에서 권장)
        this.todos[todoIndex] = {
            ...this.todos[todoIndex],
            completed: !this.todos[todoIndex].completed
        };

        return { ...this.todos[todoIndex] };
    }

    deleteTodo(id: string): void {
        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex === -1) {
            throw new Error(`할 일(${id})을 찾을 수 없습니다`);
        }

        this.todos.splice(todoIndex, 1);
    }

    updateTodo(id: string, title: string): Todo {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            throw new Error('제목은 비어있을 수 없습니다');
        }

        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex === -1) {
            throw new Error(`할 일(${id})을 찾을 수 없습니다`);
        }

        this.todos[todoIndex] = {
            ...this.todos[todoIndex],
            title: trimmedTitle
        };

        return { ...this.todos[todoIndex] };
    }
}
