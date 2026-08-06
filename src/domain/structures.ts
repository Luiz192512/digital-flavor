// Queue (FIFO) e Stack (LIFO) sao a demonstracao academica de estruturas de
// dados exigida pelo trabalho, com testes dedicados em domain.test.ts
// ('uses a FIFO queue for order preparation' e 'uses a stack for undoable
// admin actions'). NAO sao o que roda em producao: a fila de pedidos e o
// historico do admin vivem como estado React em src/App.tsx
// (setQueue / setAdminHistory), e a fila autoritativa e a tabela `orders`
// no Postgres. Mantenha as classes e os testes; nao tente "ligar" as duas
// coisas sem antes decidir quem e a fonte de verdade.
export class Queue<T> {
  private items: T[] = []

  enqueue(item: T) {
    this.items.push(item)
  }

  dequeue() {
    return this.items.shift()
  }

  peek() {
    return this.items[0]
  }

  get size() {
    return this.items.length
  }

  get isEmpty() {
    return this.items.length === 0
  }

  toArray() {
    return [...this.items]
  }
}

export class Stack<T> {
  private items: T[] = []

  push(item: T) {
    this.items.push(item)
  }

  pop() {
    return this.items.pop()
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  get size() {
    return this.items.length
  }

  get isEmpty() {
    return this.items.length === 0
  }

  toArray() {
    return [...this.items].reverse()
  }
}
