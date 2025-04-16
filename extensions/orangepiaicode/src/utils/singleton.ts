// 创建单例 class 类实例
export const Singleton = <T extends new (...args: any[]) => any>(targetConstructor: T) => {
  let instance: InstanceType<T> | null = null

  // 使用 Proxy 实现单例模式
  const proxy = new Proxy(targetConstructor, {
    construct(_target, args: ConstructorParameters<T>): InstanceType<T> {
      if (!instance) {
        instance = new targetConstructor(...args)
      }
      return instance as InstanceType<T> // 确保返回的类型符合 InstanceType<T>
    },
  }) as T

  return proxy
}
