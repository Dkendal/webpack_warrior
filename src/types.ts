declare namespace jest {
  interface Matchers<R> {
    toBeValid(): void
    toExport(localpath: string, fn: (...args: any[]) => void): void
    toOutputFile(localpath: string): void
  }
}

interface NodeModule {
  paths: string[],
}

declare module 'memfs' {
  const memfs: any;
  export = memfs;
}

declare namespace NodeJS {
  interface Module {
    _compile(source: string, filename: string): void;
  }
}

declare module 'memory-fs' {
  interface MemoryFileSystem {
    [x: string]: any;
  }

  class MemoryFileSystem {
  }

  export = MemoryFileSystem;
}
