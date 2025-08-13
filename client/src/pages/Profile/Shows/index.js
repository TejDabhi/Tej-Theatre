import { Col, Form, Modal, Row, Table, message } from "antd";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { GetAllMovies } from "../../../apicalls/movies";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import {
  AddShow,
  DeleteShow,
  GetAllShowsByTheatre,
} from "../../../apicalls/theatres";
import moment from "moment";

function Shows({ openShowsModal, setOpenShowsModal, theatre }) {
  const [view, setView] = useState("table");
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);

  const getData = async () => {
    if (!theatre?._id) return;
    try {
      dispatch(ShowLoading());

      const moviesResponse = await GetAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        message.error(moviesResponse.message);
      }

      const showsResponse = await GetAllShowsByTheatre({
        theatreId: theatre._id,
      });
      if (showsResponse.success) {
        setShows(showsResponse.data);
      } else {
        message.error(showsResponse.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const handleAddShow = async (values) => {
    if (!theatre?._id) {
      message.error("Theatre context missing");
      return;
    }
    try {
      dispatch(ShowLoading());
      const response = await AddShow({
        ...values,
        theatre: theatre._id,
      });
      if (response.success) {
        message.success(response.message);
        await getData();
        setView("table");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteShow({ showId: id });

      if (response.success) {
        message.success(response.message);
        await getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [theatre]);

  const columns = [
    {
      title: "Show Name",
      dataIndex: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => {
        return text ? moment(text).format("MMM Do YYYY") : "-";
      },
    },
    {
      title: "Time",
      dataIndex: "time",
      render: (text) => text || "-",
    },
    {
      title: "Movie",
      dataIndex: "movie",
      render: (_, record) => {
        return record?.movie?.title || "N/A";
      },
    },
    {
      title: "Ticket Price",
      dataIndex: "ticketPrice",
      render: (text) => (text != null ? text : "-"),
    },
    {
      title: "Total Seats",
      dataIndex: "totalSeats",
      render: (text) => (text != null ? text : "-"),
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      render: (_, record) => {
        const total = record?.totalSeats || 0;
        const booked = Array.isArray(record?.bookedSeats)
          ? record.bookedSeats.length
          : 0;
        return total - booked;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <div className="flex gap-1 items-center">
          {Array.isArray(record?.bookedSeats) &&
            record.bookedSeats.length === 0 && (
              <i
                className="ri-delete-bin-line"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleDelete(record._id);
                }}
              ></i>
            )}
        </div>
      ),
    },
  ];

  if (!theatre) {
    return (
      <Modal
        title="Shows"
        open={openShowsModal}
        onCancel={() => setOpenShowsModal(false)}
        footer={null}
      >
        <div>Loading theatre...</div>
      </Modal>
    );
  }

  return (
    <Modal
      title=""
      open={openShowsModal}
      onCancel={() => setOpenShowsModal(false)}
      width={1400}
      footer={null}
    >
      <h1 className="text-primary text-md uppercase mb-1">
        Theatre : {theatre.name || "Unnamed Theatre"}
      </h1>
      <hr />

      <div className="flex justify-between mt-1 mb-1 items-center">
        <h1 className="text-md uppercase">
          {view === "table" ? "Shows" : "Add Show"}
        </h1>
        {view === "table" && (
          <Button
            variant="outlined"
            title="Add Show"
            onClick={() => {
              setView("form");
            }}
          />
        )}
      </div>

      {view === "table" && (
        <Table columns={columns} dataSource={shows} rowKey="_id" />
      )}

      {view === "form" && (
        <Form layout="vertical" onFinish={handleAddShow}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label="Show Name"
                name="name"
                rules={[{ required: true, message: "Please input Show name!" }]}
              >
                <input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Please input Show date!" }]}
              >
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value); // "YYYY-MM-DD"
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Time"
                name="time"
                rules={[
                  { required: true, message: "Please input Show time!" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (selectedDate) {
                        const todayStr = moment().format("YYYY-MM-DD");
                        if (selectedDate === todayStr) {
                          // compare times
                          const nowTime = moment();
                          const inputTime = moment(value, "HH:mm");
                          if (inputTime.isBefore(nowTime)) {
                            return Promise.reject(
                              new Error("Time cannot be in the past for today")
                            );
                          }
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <input type="time" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Movie"
                name="movie"
                rules={[{ required: true, message: "Please select Movie!" }]}
              >
                <select>
                  <option value="">Select Movie</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Movie Ticket Price"
                name="ticketPrice"
                rules={[
                  { required: true, message: "Please input ticket price!" },
                ]}
              >
                <input type="number" min={90} max={600} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Total Seats"
                name="totalSeats"
                rules={[
                  { required: true, message: "Please input total seats!" },
                ]}
              >
                <input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              title="Cancel"
              onClick={() => {
                setView("table");
              }}
            />
            <Button variant="contained" title="SAVE" type="submit" />
          </div>
        </Form>
      )}
    </Modal>
  );
}

export default Shows;
