export const errorLogger = (error: any) => {
  console.error('error', error.message || error);
};
