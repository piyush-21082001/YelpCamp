var express = require('express'),
  router = express.Router({ mergeParams: true }),
  Campground = require('../models/campground'),
  Comment = require('../models/comment')
middleware = require('../middleware')

//===============comment Routes==============

//new comment form
router.get('/new', middleware.isLoggedIn, function (req, res) {
  //find camp by id and send to form
  console.log(req.params)
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      console.log(err)
    } else {
      res.render('comments/new', { campground: campground })
    }
  })
})
//handelling new comment
router.post('/', middleware.isLoggedIn, function (req, res) {
  //lookup campgrounds using id
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      console.log(err)
      redirect('/campgrounds')
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash('error', 'Something went wrong')
          console.log(err)
        } else {
          comment.author.id = req.user._id
          comment.author.username = req.user.username
          comment.save()
          campground.comments.push(comment)
          campground.save()
          req.flash('success', 'Successfully added comment')
          res.redirect(`/campgrounds/${campground._id}`)
        }
      })
    }
  })
})

//Comments edit route
router.get(
  '/:comment_id/edit',
  middleware.checkCommentOwnership,
  function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      if (err || !foundCampground) {
        console.log(err)
        console.log(!foundCampground)
        req.flash('error', 'No campground found')
        return res.redirect('back')
      }
      Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
          res.redirect('back')
        } else {
          res.render('comments/edit', {
            campground_id: req.params.id,
            comment: foundComment,
          })
        }
      })
    })
  }
)

//comments update route
router.put(
  '/:comment_id',
  middleware.checkCommentOwnership,
  function (req, res) {
    Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body.comment,
      function (err, updatedComment) {
        if (err) {
          res.redirect('back')
        } else {
          req.flash('success', 'Comment edit Success')
          res.redirect(`/campgrounds/${req.params.id}`)
        }
      }
    )
  }
)

//Comment Destroy route
router.delete(
  '/:comment_id',
  middleware.checkCommentOwnership,
  function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
      if (err) {
        res.redirect('back')
      } else {
        req.flash('success', 'Comment deleted')
        res.redirect(`/campgrounds/${req.params.id}`)
      }
    })
  }
)

module.exports = router
