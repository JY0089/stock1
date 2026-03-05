import { TodoManager } from './todo';

describe('TodoManager', () => {
    let manager: TodoManager;

    beforeEach(() => {
        manager = new TodoManager();
    });

    describe('addTodo', () => {
        it('새로운 할 일을 성공적으로 추가해야 한다', () => {
            const todo = manager.addTodo('공부하기');
            expect(todo.id).toBeDefined();
            expect(todo.title).toBe('공부하기');
            expect(todo.completed).toBe(false);
            expect(todo.createdAt).toBeInstanceOf(Date);

            const todos = manager.getTodos();
            expect(todos).toHaveLength(1);
            expect(todos[0]).toEqual(todo);
        });

        it('제목 앞뒤의 공백을 제거하고 추가해야 한다', () => {
            const todo = manager.addTodo('  운동하기  ');
            expect(todo.title).toBe('운동하기');
        });

        it('제목이 비어있거나 공백만 있는 경우 에러를 던져야 한다', () => {
            expect(() => manager.addTodo('')).toThrow('제목은 비어있을 수 없습니다');
            expect(() => manager.addTodo('   ')).toThrow('제목은 비어있을 수 없습니다');
        });
    });

    describe('getTodos', () => {
        it('빈 목록을 정상적으로 반환해야 한다 (초기 상태)', () => {
            expect(manager.getTodos()).toEqual([]);
        });

        it('추가된 모든 할 일 목록을 반환해야 한다', () => {
            manager.addTodo('첫 번째 일');
            manager.addTodo('두 번째 일');
            const todos = manager.getTodos();
            expect(todos).toHaveLength(2);
            expect(todos[0].title).toBe('첫 번째 일');
            expect(todos[1].title).toBe('두 번째 일');
        });

        it('목록이 반환될 때 불변성(Immutability)을 유지해야 한다', () => {
            manager.addTodo('테스트');
            const todos = manager.getTodos();
            todos.push({ id: 'fake', title: 'fake', completed: false, createdAt: new Date() });

            const updatedTodos = manager.getTodos();
            expect(updatedTodos).toHaveLength(1); // 외부 변경이 내부에 영향을 미치지 않아야 함
        });
    });

    describe('toggleTodo', () => {
        it('기존 완료되지 않은 할 일의 상태를 완료 처리해야 한다', () => {
            const todo = manager.addTodo('테스트');
            const toggled = manager.toggleTodo(todo.id);

            expect(toggled.completed).toBe(true);
            expect(manager.getTodos()[0].completed).toBe(true);
        });

        it('이미 완료된 할 일의 상태를 미완료 상태로 되돌려야 한다', () => {
            const todo = manager.addTodo('테스트');
            manager.toggleTodo(todo.id); // true로 변경
            const twiceToggled = manager.toggleTodo(todo.id); // false로 복구

            expect(twiceToggled.completed).toBe(false);
            expect(manager.getTodos()[0].completed).toBe(false);
        });

        it('존재하지 않는 ID로 토글을 시도할 경우 에러를 던져야 한다', () => {
            expect(() => manager.toggleTodo('invalid-id')).toThrow('할 일(invalid-id)을 찾을 수 없습니다');
        });
    });

    describe('deleteTodo', () => {
        it('주어진 ID의 할 일을 성공적으로 삭제해야 한다', () => {
            const todo = manager.addTodo('삭제할 일');
            manager.deleteTodo(todo.id);

            expect(manager.getTodos()).toHaveLength(0);
        });

        it('여러 개의 할 일 중 특정 ID만 정확히 삭제되어야 한다', () => {
            manager.addTodo('첫 번째');
            const target = manager.addTodo('두 번째 (삭제대상)');
            manager.addTodo('세 번째');

            manager.deleteTodo(target.id);
            const todos = manager.getTodos();

            expect(todos).toHaveLength(2);
            expect(todos.find(t => t.id === target.id)).toBeUndefined();
        });

        it('존재하지 않는 ID로 삭제를 시도할 경우 에러를 던져야 한다', () => {
            expect(() => manager.deleteTodo('invalid-id')).toThrow('할 일(invalid-id)을 찾을 수 없습니다');
        });
    });

    describe('updateTodo', () => {
        it('주어진 ID의 할 일 제목을 성공적으로 수정해야 한다', () => {
            const todo = manager.addTodo('수정 전');
            const updated = manager.updateTodo(todo.id, '수정 후');

            expect(updated.title).toBe('수정 후');
            expect(manager.getTodos()[0].title).toBe('수정 후');
        });

        it('수정하려는 제목의 앞뒤 공백을 제거하고 저장되어야 한다', () => {
            const todo = manager.addTodo('원래 제목');
            const updated = manager.updateTodo(todo.id, '  공백 포함 제목  ');

            expect(updated.title).toBe('공백 포함 제목');
        });

        it('빈 제목으로 수정을 시도하거나 존재하지 않는 ID일 경우 에러를 던져야 한다', () => {
            const todo = manager.addTodo('기존 제목');

            expect(() => manager.updateTodo(todo.id, '')).toThrow('제목은 비어있을 수 없습니다');
            expect(() => manager.updateTodo(todo.id, '   ')).toThrow('제목은 비어있을 수 없습니다');
            expect(() => manager.updateTodo('invalid-id', '새 제목')).toThrow('할 일(invalid-id)을 찾을 수 없습니다');
        });
    });
});
