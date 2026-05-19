// Function/custom block registry for storing and executing user-defined functions

export class FunctionRegistry {
  constructor() {
    this.functions = {};
    this.callStack = [];
  }

  define(name, params, body) {
    this.functions[name] = { name, params: params || [], body };
  }

  call(name, args = {}, executeBlock, sprite, vars) {
    const func = this.functions[name];
    if (!func) return;

    // Check for infinite recursion
    if (this.callStack.length > 100) {
      console.warn('Function recursion limit exceeded');
      return;
    }

    // Save current parameter context
    const savedParams = {};
    func.params.forEach(param => {
      savedParams[param] = vars[param];
    });

    // Set parameters from arguments
    func.params.forEach((param, idx) => {
      vars[param] = args[param] !== undefined ? args[param] : Object.values(args)[idx];
    });

    // Track call stack for recursion detection
    this.callStack.push(name);

    // Execute function body
    try {
      func.body.forEach(block => {
        executeBlock(block, sprite);
        if (sprite._returnValue !== undefined) {
          sprite._functionReturn = sprite._returnValue;
          sprite._returnValue = undefined;
          return;
        }
      });
    } finally {
      this.callStack.pop();
      // Restore previous parameter context
      func.params.forEach(param => {
        vars[param] = savedParams[param];
      });
    }

    return sprite._functionReturn;
  }

  remove(name) {
    delete this.functions[name];
  }

  exists(name) {
    return !!this.functions[name];
  }

  clear() {
    this.functions = {};
    this.callStack = [];
  }
}

export default FunctionRegistry;
