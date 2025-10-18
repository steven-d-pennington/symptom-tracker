export const WorkerPool = jest.fn().mockImplementation(() => {
  return {
    runTask: jest.fn().mockResolvedValue({}), // Default mock implementation
    terminate: jest.fn(),
  };
});
