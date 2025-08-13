import { axiosInstance } from ".";

// make payment
export const MakePayment = async (token, amount) => {
  try {
    const response = await axiosInstance.post("/api/bookings/make-payment", {
      token,
      amount,
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// book shows
export const BookShowTickets = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/api/bookings/book-show",
      payload
    );
    return response.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: error.message || "Something went wrong",
    };
  } 
};


// get bookings of a user
export const GetBookingsOfUser = async () => {
  try {
    const response = await axiosInstance.get("/api/bookings/get-bookings");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};export const CancelBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.delete(`/api/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};