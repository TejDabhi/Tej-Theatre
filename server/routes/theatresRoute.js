const router = require("express").Router();
const Show = require("../models/showModel");
const Theatre = require("../models/theatreModel"); // ✅ Import the model
const authMiddleware=require('../middlewares/authMiddleware')
// add theatre
router.post("/add-theatre", async (req, res) => {
  try {
    const newTheatre = new Theatre(req.body); // ✅ Use imported model
    await newTheatre.save();
    res.send({
      success: true,
      message: "Theatre added successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all theatres
router.get("/get-all-theatres", async (req, res) => {
  try {
    const theatres = await Theatre.find()
      .populate("owner") // ✅ Assuming 'owner' is a referenced user
      .sort({ createdAt: -1 });
    res.send({
      success: true,
      message: "Theatre fetched successfully",
      data: theatres,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
// get all theatres by owner
router.post("/get-all-theatres-by-owner",  async (req, res) => {
  try {
    const theatres = await Theatre.find({ owner: req.body.owner }).sort({
      createdAt: -1,
    });
    res.send({
      success: true,
      message: "Theatre fetched successfully",
      data: theatres,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// update theatre
router.post("/update-theatre", async (req, res) => {
  try {
    await Theatre.findByIdAndUpdate(req.body.theatreId, req.body);
    res.send({
      success: true,
      message: "Theatre updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
router.post("/delete-theatre", async (req, res) => {
  try {
    await Theatre.findByIdAndDelete(req.body.theatreId);
    res.send({
      success: true,
      message: "Theatre deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
// add show
router.post("/add-show", async (req, res) => {
  try {
    const newShow = new Show(req.body);
    await newShow.save();
    res.send({
      success: true,
      message: "Show added successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all shows by theatre
router.post("/get-all-shows-by-theatre",  async (req, res) => {
  try {
    const shows = await Show.find({ theatre: req.body.theatreId })
      .populate("movie")
      .sort({
        createdAt: -1,
      });

    res.send({
      success: true,
      message: "Show fetched successfully",
      data: shows,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// delete show
router.post("/delete-show",  async (req, res) => {
  try {
    await Show.findByIdAndDelete(req.body.showId);
    res.send({
      success: true,
      message: "Show deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
router.post("/get-all-theatres-by-movie", async (req, res) => {
  try {
    const { movie, date } = req.body;

    // find all shows of a movie
    const shows = await Show.find({ movie, date })
      .populate({
        path: "theatre",
        populate: {
          path: "owner",
          model: "users", // use correct model name if different
        },
      })
      .sort({ createdAt: -1 });

    // get all unique theatres
    let uniqueTheatres = [];
    shows.forEach((show) => {
      const theatre = uniqueTheatres.find(
        (theatre) => theatre._id.toString() === show.theatre._id.toString()
      );

      if (!theatre) {
        const showsForThisTheatre = shows.filter(
          (showObj) => showObj.theatre._id.toString() === show.theatre._id.toString()
        );
        uniqueTheatres.push({
          ...show.theatre._doc,
          shows: showsForThisTheatre,
        });
      }
    });

    res.send({
      success: true,
      message: "Theatres fetched successfully",
      data: uniqueTheatres,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/get-show-by-id", async (req, res) => {
  try {
    let showId = req.body.showId;
    if (typeof showId === "object" && showId?.showId) {
      showId = showId.showId;
    }

    const show = await Show.findById(showId)
      .populate("movie")
      .populate({
        path: "theatre",
        populate: {
          path: "owner",
          select: "name email",
          model: "users",
        },
      });

    res.send({
      success: true,
      message: "Show fetched successfully",
      data: show,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
// POST /api/theatres/get-shows-by-movie-id
router.post("/get-shows-by-movie-id", async (req, res) => {
  try {
    let { movieId } = req.body;
    if (typeof movieId === "object" && movieId?.movieId) {
      movieId = movieId.movieId;
    }

    // In Show DB, the field is named "movie" and stores movieId
    const shows = await Show.find({ movie: movieId })
      .populate("movie") // optional: populate movie details
      .populate({
        path: "theatre",
        populate: {
          path: "owner",
          select: "name email",
          model: "users",
        },
      });

    res.send({
      success: true,
      message: "Show fetched successfully",
      data: shows,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
router.post("/get-shows-by-theatre-id", async (req, res) => {
  try {
    let { theatreId } = req.body;
    if (typeof theatreId === "object" && theatreId?.theatreId) {
      theatreId = theatreId.theatreId;
    }

    const shows = await Show.find({ theatre: theatreId })
      .populate("movie")
      .populate({
        path: "theatre",
        populate: {
          path: "owner",
          select: "name email",
          model: "users",
        },
      });

    res.send({
      success: true,
      message: "Show fetched successfully",
      data: shows,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;