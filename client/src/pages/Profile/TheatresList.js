import React, { useEffect, useState } from "react";
import TheatreForm from "./TheatreForm";
import { Table, message } from "antd";
import { GetAllTheatres, DeleteTheatre } from "../../apicalls/theatres";
import { GetShowsByTheatreId } from "../../apicalls/theatres"; // new import
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../redux/loadersSlice";
import Shows from "./Shows";

function TheatresList() {
  const [showTheatreFormModal, setShowTheatreFormModal] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [formType, setFormType] = useState("add");
  const [theatres, setTheatres] = useState([]);
  const dispatch = useDispatch();
  const [openShowsModal, setOpenShowsModal] = useState(false);
  const [theatresWithShows, setTheatresWithShows] = useState(new Set());

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllTheatres();
      if (response.success) {
        const theatreList = response.data;
        setTheatres(theatreList);

        // Check shows for each theatre
        const theatreIdsWithShows = new Set();
        for (const theatre of theatreList) {
          const showsResp = await GetShowsByTheatreId(theatre._id);
          if (showsResp.success && showsResp.data.length > 0) {
            theatreIdsWithShows.add(theatre._id);
          }
        }
        setTheatresWithShows(theatreIdsWithShows);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const handleDelete = async (theatreId) => {
    try {
      dispatch(ShowLoading());

      // Double-check before delete
      const showsResp = await GetShowsByTheatreId(theatreId);
      if (showsResp.success && showsResp.data.length > 0) {
        dispatch(HideLoading());
        return message.error("Cannot delete: Theatre has shows scheduled.");
      }

      const response = await DeleteTheatre({ theatreId });
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
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => {
            setFormType("add");
            setSelectedTheatre(null);
            setShowTheatreFormModal(true);
          }}
          style={{
            backgroundColor: "#1677ff",
            color: "#fff",
            padding: "8px 16px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#4096ff")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#1677ff")}
        >
          Add Theatre
        </button>
      </div>

      <Table
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Address", dataIndex: "address" },
          { title: "Phone", dataIndex: "phone" },
          { title: "Email", dataIndex: "email" },
          {
            title: "Status",
            dataIndex: "isActive",
            render: (text) => (text ? "Approved" : "Pending / Blocked"),
          },
          {
            title: "Actions",
            render: (_, record) => {
              const hasShows = theatresWithShows.has(record._id);
              return (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    aria-label="edit theatre"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedTheatre(record);
                      setFormType("edit");
                      setShowTheatreFormModal(true);
                    }}
                  >
                    <i className="ri-pencil-line" />
                  </button>

                  {!hasShows && (
                    <button
                      aria-label="delete Theatre"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "red",
                      }}
                      onClick={() => handleDelete(record._id)}
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  )}

                  {record.isActive && (
                    <span
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => {
                        setSelectedTheatre(record);
                        setOpenShowsModal(true);
                      }}
                    >
                      Shows
                    </span>
                  )}
                </div>
              );
            },
          },
        ]}
        dataSource={theatres}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      {showTheatreFormModal && (
        <TheatreForm
          showTheatreFormModal={showTheatreFormModal}
          setShowTheatreFormModal={setShowTheatreFormModal}
          formType={formType}
          setFormType={setFormType}
          selectedTheatre={selectedTheatre}
          setSelectedTheatre={setSelectedTheatre}
          getData={getData}
        />
      )}
      {openShowsModal && (
        <Shows
          openShowsModal={openShowsModal}
          setOpenShowsModal={(val) => {
            setOpenShowsModal(val);
            if (!val) setSelectedTheatre(null);
          }}
          theatre={selectedTheatre}
        />
      )}
    </div>
  );
}

export default TheatresList;