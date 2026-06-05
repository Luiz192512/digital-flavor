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
