const logError = (error, context = "Unknown Context") => {
  console.error("Error during [${context}]:");
  try {
    // Print message and stack if available
    console.error("message:", error.message);
    console.error("stack:", error.stack);
    // Sequelize stores original DB error on `error.original` or `error.parent`
    if (error.original) console.error("original:", error.original);
    if (error.parent) console.error("parent:", error.parent);
    // Print a serialized version of the error object to capture any extra fields
    console.error(
      "error details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
  } catch (logErr) {
    console.error("Failed to stringify error:", logErr);
    console.error(error);
  }
};

const getErrorResponse = (error) => {
  if (error.name === "SequelizeValidationError") {
    const messages = error.errors.map((err) => err.message);
    return { status: 400, json: { errors: messages } };
  }

  if (error.message.includes("Server Configuration Error")) {
    return {
      status: 500,
      json: { message: "Internal Server Configuration Error" },
    };
  }
  return { status: 500, json: { message: "Server error" } };
};
module.exports = { logError, getErrorResponse };
