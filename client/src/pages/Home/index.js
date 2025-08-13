import { useEffect, useState } from "react";
import { Col, message, Row } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { GetAllMovies } from "../../apicalls/movies";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import Admin from "../Admin";

function Home() {
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllMovies();
      if (response.success) {
        setMovies(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="home-container">
      {!user?.isAdmin && (
        <>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search for Movie..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Row gutter={[20]} className="mt-2">
            {movies
              .filter((movie) =>
                movie.title.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((movie) => (
                <Col xs={24} sm={12} md={8} lg={6} key={movie._id}>
                  <div
                    className="movie-card"
                    onClick={() =>
                      navigate(
                        `/movie/${movie._id}?date=${moment().format(
                          "YYYY-MM-DD"
                        )}`
                      )
                    }
                  >
                    <div className="movie-poster-wrapper">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster"
                      />
                    </div>
                    <div className="movie-info">
                      <h1>{movie.title}</h1>
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
        </>
      )}
      {user?.isAdmin && (
        <div className="admin-message">
          <h1>Welcome, {user.name} </h1>
          <br />
          <h3>
            Welcome, Admin! You can only manage movies and Approval of Theatres.
          </h3>
          <button onClick={() => navigate("/admin")}>Go to Admin Panel</button>
        </div>
      )}
    </div>
  );
}

export default Home;
