var express = require('express'),
  Campground = require('../models/campground'),
  Comment = require('../models/comment'),
  router = express.Router()
middleware = require('../middleware')

// INDEX - show all campgrounds
router.get('/', function (req, res) {
  //Get all campgrounds from DB
  Campground.find(function (err, allCampgrounds) {
    if (err) {
      console.log(err)
    } else {
      res.render('campgrounds/index', { campgrounds: allCampgrounds })
    }
  })
})

// CREATE - add new campgrounds to DB
router.post('/', middleware.isLoggedIn, function (req, res) {
  var name = req.body.name
  var price = req.body.price
  var image = req.body.image
  var desc = req.body.description
  var author = {
    id: req.user._id,
    username: req.user.username,
  }
  var newCampground = {
    name: name,
    price: price,
    image: image,
    author: author,
    description: desc,
  }

  //create new campground and save to DB
  Campground.create(newCampground, function (err, newlyCreated) {
    if (err) {
      console.log(err)
    } else {
      //redirect back to campgrounds page
      res.redirect('/campgrounds')
    }
  })
})

// NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, function (req, res) {
  res.render('campgrounds/new')
})

// SHOW - view details on specific campgrounds
router.get('/:id', function (req, res) {
  //find the campground with matching id
  Campground.findById(req.params.id)
    .populate('comments')
    .exec(function (err, foundCampground) {
      if (err || !foundCampground) {
        req.flash('error', 'Campground not found')
        res.redirect('back')
        console.log(err)
      } else {
        //render show template with that campground
        res.render('campgrounds/show', { campground: foundCampground })
      }
    })
})

// EDIT - shows edit form for a campground
router.get(
  '/:id/edit',
  middleware.checkCampgroundOwnership,
  function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      res.render('campgrounds/edit', { campground: foundCampground })
    })
  }
)

// PUT - updates campground in the database
router.put('/:id', middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground,
    function (err, updatedCampground) {
      if (err) {
        res.redirect('/campgrounds')
      } else {
        res.redirect(`/campgrounds/${req.params.id}`)
      }
    }
  )
})

// DESTROY campground
router.delete('/:id', middleware.checkCampgroundOwnership, function (req, res) {
  //before deleting campground all its comments must be removed
  Campground.findById(req.params.id, function (err, camp) {
    if (err) {
      console.log(err)
    } else {
      camp.comments.forEach(function (commentid) {
        Comment.findByIdAndDelete(commentid, function (err) {
          if (err) {
            console.log(err)
          }
        })
      })
    }
  })
  //now remove campground
  Campground.findByIdAndDelete(req.params.id, function (err) {
    if (err) {
      res.redirect('/campgrounds')
    } else {
      res.redirect('/campgrounds')
    }
  })
})

module.exports = router
