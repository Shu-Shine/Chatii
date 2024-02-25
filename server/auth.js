
function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}



module.exports = {
  populateCurrentUser,

};
