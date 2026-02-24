import { fetchWithAuth } from "../apiClient.js";
import axios from "axios";

// user registration
export const createUser = async (data) => {
  return await fetchWithAuth(`/createUser`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// user update
export const updateUser = async (data) => {
  return await fetchWithAuth(`/update`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};
// update user password
export const updateUserPassword = async (data) => {
  return await fetchWithAuth(`/password`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getUserList = async (data) => {
  return await fetchWithAuth(`/allUsers`, {
    method: "GET",
  });
};

// get unique token link
export const getUserUniqueTokenLink = async (data) => {
  return await fetchWithAuth(`/getUserToken/${data}`, {
    method: "GET",
  });
};


// delete user
export const deleteUser = async (userid) => {
  return await fetchWithAuth(`/delete/${userid}`, {
    method: "POST",
  });
};

export const trackData = async () => {
  return await fetchWithAuth(`/tracking`, {
    method: "GET",
  });
};


// export const exportSurveyReportUser = async () => {
//   return await axios.get(`/api/export`, {
//     responseType: "blob",
//     headers: {
//       Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//     },
//   });
// };
export const exportSurveyReportUser = async () => {
  return await fetchWithAuth(`/export`, {
    method: "GET",
    responseType: "blob",
  });
};

export const allUserSurveyData = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await fetchWithAuth(`/allUserData/${query ? `?${query}` : ""}`, {
    method: "GET",
  });
};

export const allUsersList = async () => {
  return await fetchWithAuth(`/allUser`, {
    method: "GET",
  });
};


//================ Survey form apis started ===============================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// survey form
export const saveSurveyForm = async (data) => {
  try {
    const res = await api.post("/save", data);
    return res.data;
  } catch (err) {
    console.error("Save Survey Error:", err);
    // return { status: false, message: "Server error" };
    const errorMessage =
      err?.response?.data?.message || err?.message || "Network request failed.";

    throw { status: false, message: errorMessage };
  }
};

// Send OTP
// export const sendOtp = async (data) => {
//   try {
//     const res = await api.post("/sendOtp", data);
//     return res.data;
//   } catch (err) {
//     console.error("Send OTP Error:", err);
//     return { status: false, message: "Server error" };
//   }
// };

// Send OTP
export const sendOtp = async (data) => {
  try {
    const res = await api.post("/sendOtp", data);
    return res.data;
  } catch (err) {
    console.error("Send OTP Error:", err);

    const errorMessage =
      err?.response?.data?.message || err?.message || "Network request failed.";

    throw { status: false, message: errorMessage };
  }
};
// Verify OTP
export const verifyOtp = async (data) => {
  try {
    const res = await api.post("/verifyOtp", data);
    return res.data;
  } catch (err) {
    console.error("Verify OTP Error:", err);
    // return { status: false, message: "Server error" };
    const errorMessage =
      err?.response?.data?.message || err?.message || "Network request failed.";

    throw { status: false, message: errorMessage };
  }
};
//================ Models Crud APIs ===============================

// Create Model
export const createModel = async (data) => {
  return await fetchWithAuth(`/brand`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Update Model
export const updateModel = async (data) => {
  return await fetchWithAuth(`/brand`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Delete
export const deleteModel = async (id) => {
  return await fetchWithAuth(`/brand/${id}`, {
    method: "DELETE",
  });
};

// Restore Deleted Model
export const restoreDeletedModel = async (id) => {
  return await fetchWithAuth(`/brand/restore/${id}`, {
    method: "POST",
  });
};

// Get Model
export const getModel = async (data) => {
  return await fetchWithAuth(`/brand`, {
    method: "GET",
  });
};

// Get Model
export const getModelPublic = async (data) => {
  try {
    const res = await api.get("/brand", data);
    return res.data;
  } catch (err) {
    console.error("Error:", err);
    return { status: false, message: "Server error" };
  }
};

// Get Deleted Model
export const getDeletedModel = async (data) => {
  return await fetchWithAuth(`/brand/deleted`, {
    method: "GET",
  });
};

// Delete Deleted Model Permanent
export const deleteDeletedModelPermanent = async (data) => {
  return await fetchWithAuth(`/brand/deleted/${data}`, {
    method: "DELETE",
  });
};
