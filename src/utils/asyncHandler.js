export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } 
    catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        error: error.response?.data || null,
      });
    }
  };
};
