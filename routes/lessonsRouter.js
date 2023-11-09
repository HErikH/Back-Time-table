const express = require('express');
const router = express.Router();
const LessonsController = require('../controllers/LessonsController.js');
const Authorization = require("../middlewares/authorization.js");

/* POST home page. */
router.post('/create', Authorization, LessonsController.createLesson);
router.post('/update', Authorization, LessonsController.updateLesson);
router.post('/put/without/error', Authorization, LessonsController.putLessonWithoutError);
router.post('/put/with/error', Authorization, LessonsController.putLessonWithError);
router.post('/delete/lesson', Authorization, LessonsController.deleteLessonFromPlaces);
router.post('/delete', Authorization, LessonsController.deleteLesson);

module.exports = router;
