// export const API_BASE_URL =
//   "https://warehouse-backend-5k35.onrender.com/api/v1/";
console.log("sdasd", process.env.REACT_APP_API_URL);
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3300/api/v1/";
