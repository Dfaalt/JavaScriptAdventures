export interface SandboxContext {
  [key: string]: any;
}

export const runCodeInSandbox = (
  userCode: string,
  context: SandboxContext
): { success: boolean; error?: string; output?: string } => {
  try {
    // Create a safe function with restricted scope
    const allowedGlobals = {
      console: {
        log: (...args: any[]) => {
          return args.map(arg => String(arg)).join(' ');
        }
      },
      ...context
    };

    // Create function parameters from context
    const contextKeys = Object.keys(allowedGlobals);
    const contextValues = Object.values(allowedGlobals);

    // Create and execute the function
    const fn = new Function(...contextKeys, userCode);
    fn(...contextValues);

    return { success: true, output: 'Code executed successfully!' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
